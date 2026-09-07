require('dotenv').config();
const { Sequelize } = require('sequelize');

// Three connection modes, chosen automatically:
// 1. Test runs (NODE_ENV=test, set automatically by Jest) use an in-memory
//    SQLite database — fast, isolated, no external service needed.
// 2. Deployed environments (e.g. Render) provide DATABASE_URL, a full
//    connection string. Sequelize infers the dialect (postgres/mysql) from
//    the URL scheme itself.
// 3. Local development falls back to individual DB_* vars against MySQL,
//    exactly as before — nothing changes for your existing XAMPP setup.

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else if (process.env.DATABASE_URL) {
  const needsSSL = process.env.DB_SSL === 'true' || process.env.DATABASE_URL.includes('render.com');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialectOptions: needsSSL ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
}

module.exports = sequelize;
