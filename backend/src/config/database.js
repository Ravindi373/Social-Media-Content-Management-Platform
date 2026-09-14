require('dotenv').config();
const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'test') {
  sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });
} else {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required to connect to Supabase.');
  }
  
  // Supabase PostgreSQL connections require SSL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: false,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
}

module.exports = sequelize;
