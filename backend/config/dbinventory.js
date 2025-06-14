const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host: process.env.PSQLHOST,
  port: Number(process.env.PSQLPORT),
  database: process.env.PSQLDB,
  user: process.env.PSQLUSER,
  password: String(process.env.PSQLPASS).trim(),
  // idleTimeoutMillis: 30000,
});

// Add connection test
pool.connect((err, client, release) => {
  if (err) {
    return console.error('❌ Error acquiring client for PostgreSQL', err.stack);
  }
  console.log('✅ PostgreSQL connection established');
  client.release(); // release the client back to the pool
});

module.exports = pool;
