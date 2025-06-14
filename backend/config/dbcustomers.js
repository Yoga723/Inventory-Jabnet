// config/dbMaria.js
const mariadb = require("mariadb");
require("dotenv").config();

const poolMaria = mariadb.createPool({
  host: process.env.DB_CUSTOMERS_HOST,
  port: Number(process.env.DB_CUSTOMERS_PORT),
  user: process.env.DB_CUSTOMERS_USER,
  password: process.env.DB_CUSTOMERS_PASS.trim(),
  database: process.env.DB_CUSTOMERS_NAME,
  connectionLimit: 10, // at most 10 concurrent connections
  acquireTimeout: 5000,
  supportBigNumbers: true, // Enable support for BIGINT
  bigNumberStrings: true, // Return BIGINTs as strings
});

poolMaria
  .getConnection()
  .then((conn) => {
    console.log("✅ MariaDB connection established");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MariaDB connection failed:", err.message);
    // // optional: exit process so you notice immediately
    // process.exit(1);
  });

module.exports = poolMaria;
