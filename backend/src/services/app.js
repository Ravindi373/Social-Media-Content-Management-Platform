const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

const app = express();

// In production, set CLIENT_URL to your deployed frontend's exact origin
// (e.g. https://your-app.vercel.app) to restrict CORS to just that site.
// Left unset, CORS stays open — fine for local development against
// localhost:5173, but tighten this once you deploy.
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', routes);

// 404 handler
app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

module.exports = app;
