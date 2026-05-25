const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

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

app.get("/api/employees", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        e.employee_id,
        e.full_name,
        e.email,
        e.employment_type,
        m.full_name AS manager_name
      FROM employees e
      LEFT JOIN employees m ON e.manager_id = m.employee_id
      ORDER BY e.employee_id;
    `);

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