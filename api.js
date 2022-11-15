import express from 'express';
const api = express.Router();

// Routes
import authRouter from './routes/auth.routes.js';
import menuRouter from './routes/menu.routes.js';
import tableRouter from './routes/table.routes.js';
import ordersRouter from './routes/orders.routes.js';
import employeeRouter from './routes/employee.routes.js';
import dashboardRouter from './routes/dashboard.routes.js';

// Api routes
api.use('/auth', authRouter);

api.use('/menu', menuRouter);

api.use('/table', tableRouter);

api.use('/orders', ordersRouter);

api.use('/employees', employeeRouter);

api.use('/dashboard', dashboardRouter);

export default api;