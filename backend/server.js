const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const pool = require("./config/db");
require("dotenv").config();

const app = express();
const TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET || "dev-team-attendance-secret";
const TOKEN_TTL_SECONDS = 60 * 60 * 8;

app.use(cors());
app.use(express.json());

const base64Url = (value) =>
  Buffer.from(value).toString("base64url");

const signPayload = (payload) =>
  crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payload)
    .digest("base64url");

const createToken = (user) => {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(
    JSON.stringify({
      sub: user.user_id,
      employee_id: user.employee_id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    })
  );
  const signature = signPayload(`${header}.${payload}`);

  return `${header}.${payload}.${signature}`;
};

const verifyToken = (token) => {
  const [header, payload, signature] = token.split(".");

  if (!header || !payload || !signature) {
    throw new Error("Invalid token");
  }

  const expectedSignature = signPayload(`${header}.${payload}`);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    provided.length !== expected.length ||
    !crypto.timingSafeEqual(provided, expected)
  ) {
    throw new Error("Invalid token");
  }

  const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

  if (!decoded.exp || decoded.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token expired");
  }

  return decoded;
};

const verifyPassword = (password, storedHash) => {
  const [scheme, salt, hash] = storedHash.split("$");

  if (scheme !== "scrypt" || !salt || !hash) {
    return false;
  }

  const hashBuffer = Buffer.from(hash, "hex");
  const passwordHash = crypto.scryptSync(password, salt, hashBuffer.length);

  return (
    hashBuffer.length === passwordHash.length &&
    crypto.timingSafeEqual(hashBuffer, passwordHash)
  );
};

const publicUserFields = (user) => ({
  user_id: user.user_id,
  employee_id: user.employee_id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
});

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = verifyToken(token);
    const result = await pool.query(
      `
      SELECT
        ua.user_id,
        ua.employee_id,
        ua.email,
        ua.role,
        e.full_name
      FROM user_accounts ua
      JOIN employees e ON e.employee_id = ua.employee_id
      WHERE ua.user_id = $1 AND ua.is_active = TRUE
      `,
      [decoded.sub]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ error: "Authentication required" });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication required" });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "You do not have access to this resource" });
  }

  next();
};

app.get("/", (req, res) => {
  res.send("Team Attendance Backend Running");
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      success: true,
      message: "Database connected successfully",
      time: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const result = await pool.query(
      `
      SELECT
        ua.user_id,
        ua.employee_id,
        ua.email,
        ua.password_hash,
        ua.role,
        e.full_name
      FROM user_accounts ua
      JOIN employees e ON e.employee_id = ua.employee_id
      WHERE LOWER(ua.email) = LOWER($1) AND ua.is_active = TRUE
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user || !verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = createToken(user);

    res.json({
      token,
      user: publicUserFields(user),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: publicUserFields(req.user) });
});

app.get("/api/employees", authenticate, authorize("admin", "manager"), async (req, res) => {
  try {
    const values = [];
    let accessFilter = "";

    if (req.user.role === "manager") {
      values.push(req.user.employee_id);
      accessFilter = "WHERE e.manager_id = $1 OR e.employee_id = $1";
    }

    const result = await pool.query(`
      SELECT 
        e.employee_id,
        e.full_name,
        e.email,
        e.employment_type,
        COALESCE(ua.role, 'employee') AS role,
        m.full_name AS manager_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      LEFT JOIN user_accounts ua ON ua.employee_id = e.employee_id
      ${accessFilter}
      ORDER BY e.employee_id;
    `, values);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
