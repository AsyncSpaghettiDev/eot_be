import express from 'express';
const api = express.Router();

import { getOrders, updateOrderStatus } from '../controllers/orders.controller.js';

api.get('/', getOrders);

api.put('/:order_id', updateOrderStatus);

export default api;
