const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

const initDB = async () => {
  try {
    const schemaPath = path.join(__dirname, "sql", "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);

    console.log("Database tables created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Database initialization failed");
    console.error(error.message);
    process.exit(1);
  }
};

initDB();