import express from 'express';
const api = express.Router();

import { createOrder, getCheck, getOrder, getTableOrder } from '../controllers/table.controller.js';

api.get('/order/:tableId', getTableOrder);

api.get('/order/detailed/:orderId', getOrder);

api.put('/checkout/:activityId', getCheck);

api.post('/order', createOrder);

export default api;