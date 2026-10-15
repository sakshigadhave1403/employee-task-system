const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.get('/', (req, res) =>
     res.json({ success: true, message: 'Employee & Task Management API', health: '/api/health' })
   );

app.get('/api/health', (req, res) => res.json({ success: true, message: 'API is running' }));

app.use('/api/employees', require('./routes/employee.routes'));
app.use('/api/tasks', require('./routes/task.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use(errorHandler);

module.exports = app;