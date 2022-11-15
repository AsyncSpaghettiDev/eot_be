import express from 'express';
const api = express.Router();

import { createEmployee, getEmployees, updateEmployee } from '../controllers/employee.controller.js';

api.get('/', getEmployees);

api.post('/', createEmployee);

api.put('/:id', updateEmployee);

export default api;