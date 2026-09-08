require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/db');

const port = Number(process.env.PORT) || 5000;

connectDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`API listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error(`Failed to start API: ${error.message}`);
    process.exit(1);
  });
