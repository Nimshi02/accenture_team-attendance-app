const fs = require("fs");
const path = require("path");
const pool = require("./config/db");

const seedDB = async () => {
  try {
    const seedPath = path.join(__dirname, "sql", "seed.sql");
    const seed = fs.readFileSync(seedPath, "utf8");

    await pool.query(seed);

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Database seeding failed");
    console.error(error.message);
    process.exit(1);
  }
};

seedDB();