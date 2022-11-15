import express from 'express';
const api = express.Router();

import {
    createCategory,
    createPlate,
    getCategories,
    getMenuPlates,
    updateMenuPlate
} from '../controllers/menu.controller.js';

api.get('/', getMenuPlates);

api.get('/getCategories', getCategories);

api.put('/:menuPlateId', updateMenuPlate);

api.post('/', createPlate);

api.post('/category', createCategory);

export default api;