import express from 'express';
const api = express.Router();

import { createActivity, createTable, deleteActivity, getTables, updateTable } from '../controllers/dashboard.controller.js';

api.get('/tables', getTables);

api.post('/table', createTable);

api.post('/tables/:tableId', createActivity);

api.put('/tables/:tableId', updateTable);

api.delete('/tables/:tableId', deleteActivity);

export default api;