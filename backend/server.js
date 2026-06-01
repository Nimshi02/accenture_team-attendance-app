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

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const formatDateOnly = (date) => date.toISOString().slice(0, 10);

const parseDateOnly = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const startOfWeek = (date) => {
  const weekStart = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));
  const dayOffset = weekStart.getUTCDay() === 0 ? -6 : 1 - weekStart.getUTCDay();
  weekStart.setUTCDate(weekStart.getUTCDate() + dayOffset);

  return weekStart;
};

const endOfMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0));

const startOfMonth = (date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const workingDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const buildScheduleResponse = async (employeeId, requestedDate, view = "week") => {
  const isMonthView = view === "month";
  const periodStart = isMonthView ? startOfMonth(requestedDate) : startOfWeek(requestedDate);
  const periodEnd = isMonthView ? endOfMonth(requestedDate) : new Date(periodStart);

  if (!isMonthView) {
    periodEnd.setUTCDate(periodStart.getUTCDate() + 6);
  }

  const scheduleResult = await pool.query(
    `
    SELECT
      eds.day_of_week,
      wl.location_name
    FROM employee_default_schedule eds
    JOIN work_locations wl ON wl.location_id = eds.location_id
    WHERE eds.employee_id = $1;
    `,
    [employeeId]
  );

  const locationByDay = scheduleResult.rows.reduce((locationMap, schedule) => ({
    ...locationMap,
    [schedule.day_of_week]: schedule.location_name,
  }), {});

  const dayCount = Math.round((periodEnd - periodStart) / 86400000) + 1;

  const days = Array.from({ length: dayCount }, (_, index) => {
    const date = new Date(periodStart);
    date.setUTCDate(periodStart.getUTCDate() + index);

    const dayName = dayNames[date.getUTCDay()];
    const isWorkingDay = date.getUTCDay() >= 1 && date.getUTCDay() <= 5;
    const plannedLocation = isWorkingDay
      ? locationByDay[dayName] || "Office"
      : null;

    return {
      date: formatDateOnly(date),
      day_name: dayName,
      planned_location: plannedLocation,
      schedule_type: isWorkingDay ? "Full Day" : null,
    };
  });

  const recurring = Object.entries(
    days
      .filter((day) => day.planned_location)
      .reduce((groups, day) => ({
        ...groups,
        [day.planned_location]: (groups[day.planned_location] || []).includes(day.day_name)
          ? groups[day.planned_location]
          : [
              ...(groups[day.planned_location] || []),
              day.day_name,
            ],
      }), {})
  ).map(([location_name, days_of_week]) => ({
    location_name,
    days_of_week,
  }));

  return {
    view: isMonthView ? "month" : "week",
    week_start: formatDateOnly(startOfWeek(requestedDate)),
    week_end: formatDateOnly((() => {
      const weekEnd = startOfWeek(requestedDate);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
      return weekEnd;
    })()),
    period_start: formatDateOnly(periodStart),
    period_end: formatDateOnly(periodEnd),
    days,
    recurring,
  };
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

app.get("/api/profile", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        e.employee_id,
        e.full_name,
        e.email,
        e.employment_type,
        e.phone_number,
        TO_CHAR(e.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
        e.address,
        e.department,
        e.designation,
        TO_CHAR(e.date_of_joining, 'YYYY-MM-DD') AS date_of_joining,
        COALESCE(ua.role, 'employee') AS role,
        m.full_name AS manager_name
      FROM employees e
      LEFT JOIN employees m ON m.employee_id = e.manager_id
      LEFT JOIN user_accounts ua ON ua.employee_id = e.employee_id
      WHERE e.employee_id = $1;
      `,
      [req.user.employee_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.patch("/api/profile", authenticate, async (req, res) => {
  try {
    const {
      address,
      date_of_birth,
      full_name,
      phone_number,
    } = req.body;

    const normalizedName = typeof full_name === "string" ? full_name.trim() : "";

    if (!normalizedName) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const nullableText = (value) => {
      if (typeof value !== "string") {
        return null;
      }

      const trimmedValue = value.trim();
      return trimmedValue || null;
    };

    const nullableDate = (value) => {
      if (!value) {
        return null;
      }

      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        throw new Error("Dates must use YYYY-MM-DD format");
      }

      return value;
    };

    const result = await pool.query(
      `
      WITH updated_employee AS (
        UPDATE employees
        SET
          full_name = $2,
          phone_number = $3,
          date_of_birth = $4,
          address = $5
        WHERE employee_id = $1
        RETURNING *
      )
      SELECT
        e.employee_id,
        e.full_name,
        e.email,
        e.employment_type,
        e.phone_number,
        TO_CHAR(e.date_of_birth, 'YYYY-MM-DD') AS date_of_birth,
        e.address,
        e.department,
        e.designation,
        TO_CHAR(e.date_of_joining, 'YYYY-MM-DD') AS date_of_joining,
        COALESCE(ua.role, 'employee') AS role,
        m.full_name AS manager_name
      FROM updated_employee e
      LEFT JOIN employees m ON m.employee_id = e.manager_id
      LEFT JOIN user_accounts ua ON ua.employee_id = e.employee_id;
      `,
      [
        req.user.employee_id,
        normalizedName,
        nullableText(phone_number),
        nullableDate(date_of_birth),
        nullableText(address),
      ]
    );

    res.json(result.rows[0]);
  } catch (error) {
    const status = error.message.includes("YYYY-MM-DD") ? 400 : 500;

    res.status(status).json({
      error: error.message,
    });
  }
});

app.get("/api/schedule", authenticate, async (req, res) => {
  try {
    const requestedDate = parseDateOnly(req.query.week_start) || new Date();
    const view = req.query.view === "month" ? "month" : "week";
    const schedule = await buildScheduleResponse(req.user.employee_id, requestedDate, view);

    res.json(schedule);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/attendance/today", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        ar.attendance_id,
        TO_CHAR(ar.attendance_date, 'YYYY-MM-DD') AS attendance_date,
        planned.location_name AS planned_location,
        actual.location_name AS actual_location,
        ar.status
      FROM attendance_records ar
      JOIN work_locations planned ON planned.location_id = ar.planned_location_id
      JOIN work_locations actual ON actual.location_id = ar.actual_location_id
      WHERE ar.employee_id = $1
        AND ar.attendance_date = CURRENT_DATE;
      `,
      [req.user.employee_id]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/attendance/summary", authenticate, async (req, res) => {
  try {
    const requestedDate = parseDateOnly(req.query.week_start) || new Date();
    const weekStart = startOfWeek(requestedDate);
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

    const summaryResult = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE ar.status = 'Present')::INTEGER AS total_present,
        COUNT(*) FILTER (WHERE ar.status = 'Absent')::INTEGER AS total_absent,
        COUNT(*) FILTER (
          WHERE ar.status = 'Present' AND actual.location_name = 'Home'
        )::INTEGER AS total_work_from_home
      FROM attendance_records ar
      JOIN work_locations actual ON actual.location_id = ar.actual_location_id
      WHERE ar.employee_id = $1
        AND ar.attendance_date BETWEEN $2 AND $3;
      `,
      [
        req.user.employee_id,
        formatDateOnly(weekStart),
        formatDateOnly(weekEnd),
      ]
    );

    const recordsResult = await pool.query(
      `
      SELECT
        ar.attendance_id,
        TO_CHAR(ar.attendance_date, 'YYYY-MM-DD') AS attendance_date,
        planned.location_name AS planned_location,
        actual.location_name AS actual_location,
        ar.status
      FROM attendance_records ar
      JOIN work_locations planned ON planned.location_id = ar.planned_location_id
      JOIN work_locations actual ON actual.location_id = ar.actual_location_id
      WHERE ar.employee_id = $1
        AND ar.attendance_date BETWEEN $2 AND $3
      ORDER BY ar.attendance_date;
      `,
      [
        req.user.employee_id,
        formatDateOnly(weekStart),
        formatDateOnly(weekEnd),
      ]
    );

    res.json({
      week_start: formatDateOnly(weekStart),
      week_end: formatDateOnly(weekEnd),
      total_present: summaryResult.rows[0].total_present,
      total_absent: summaryResult.rows[0].total_absent,
      total_work_from_home: summaryResult.rows[0].total_work_from_home,
      records: recordsResult.rows,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.patch("/api/schedule/recurring", authenticate, async (req, res) => {
  const client = await pool.connect();

  try {
    const { schedule, view, week_start } = req.body;

    if (!Array.isArray(schedule) || schedule.length !== workingDayNames.length) {
      return res.status(400).json({ error: "A schedule for Monday to Friday is required" });
    }

    const locationResult = await client.query(
      "SELECT location_id, location_name FROM work_locations;"
    );
    const locationIdsByName = locationResult.rows.reduce((locationMap, location) => ({
      ...locationMap,
      [location.location_name]: location.location_id,
    }), {});

    for (const item of schedule) {
      if (!workingDayNames.includes(item.day_of_week)) {
        return res.status(400).json({ error: "Schedule can only include weekdays" });
      }

      if (!locationIdsByName[item.location_name]) {
        return res.status(400).json({ error: "Unknown work location" });
      }
    }

    await client.query("BEGIN");
    await client.query(
      "DELETE FROM employee_default_schedule WHERE employee_id = $1;",
      [req.user.employee_id]
    );

    for (const item of schedule) {
      await client.query(
        `
        INSERT INTO employee_default_schedule (employee_id, day_of_week, location_id)
        VALUES ($1, $2, $3);
        `,
        [
          req.user.employee_id,
          item.day_of_week,
          locationIdsByName[item.location_name],
        ]
      );
    }

    await client.query("COMMIT");

    const requestedDate = parseDateOnly(week_start) || new Date();
    const updatedSchedule = await buildScheduleResponse(
      req.user.employee_id,
      requestedDate,
      view === "month" ? "month" : "week"
    );

    res.json(updatedSchedule);
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      error: error.message,
    });
  } finally {
    client.release();
  }
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

app.get("/api/notifications", authenticate, async (req, res) => {
  try {
    const { category = "all" } = req.query;
    const values = [req.user.employee_id];
    let categoryFilter = "";

    if (category !== "all") {
      values.push(category);
      categoryFilter = "AND category = $2";
    }

    const result = await pool.query(
      `
      SELECT
        notification_id,
        category,
        type,
        title,
        message,
        is_read,
        created_at
      FROM notifications
      WHERE employee_id = $1
      ${categoryFilter}
      ORDER BY created_at DESC, notification_id DESC;
      `,
      values
    );

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.get("/api/notifications/unread-count", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT COUNT(*)::INTEGER AS unread_count
      FROM notifications
      WHERE employee_id = $1 AND is_read = FALSE;
      `,
      [req.user.employee_id]
    );

    res.json({ unread_count: result.rows[0].unread_count });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

app.patch("/api/notifications/read-all", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE employee_id = $1 AND is_read = FALSE
      RETURNING notification_id;
      `,
      [req.user.employee_id]
    );

    res.json({ updated_count: result.rowCount });
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
