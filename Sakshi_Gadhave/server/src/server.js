require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 5000, () => console.log('Server running'));
  })
  .catch((err) => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });