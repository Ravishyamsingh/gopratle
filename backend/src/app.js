const cors = require('cors');
const express = require('express');
const requirementRoutes = require('./routes/requirementRoutes');

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS.'));
    },
  })
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});
app.use('/api/requirements', requirementRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ success: false, message: 'Something went wrong.' });
});

module.exports = app;
