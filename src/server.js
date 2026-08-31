require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    // Prototype-friendly: sync models to tables directly instead of
    // hand-writing migrations. Use { force: true } to reset tables during dev.
    await sequelize.sync({ alter: true });
    console.log('Database connected and synced.');

    app.listen(PORT, () => {
      console.log(`SMCMP API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
}

start();
