import database from '../database/database.cjs';

export const getMenuPlates = async (_, res) => {
    const menuPlatesQuery =
        `SELECT *, categories.category__name as plate__category FROM plates 
        JOIN categories 
        ON plates.plate__category__id = categories.category__id
        ORDER BY plate__category__id ASC, plate__name ASC;`
    const menuPlatesResponse = await database.db.promise().query(menuPlatesQuery);

    const menuPlates = menuPlatesResponse[0];
    let lastCategory;
    let plates = [];

    menuPlates.forEach((plate) => {
        if (lastCategory !== plate.plate__category) {
            plates.push({
                category: plate.plate__category,
                plates: []
            });
            lastCategory = plate.plate__category;
        }
        plates[plates.length - 1].plates.push(plate);
    });

    res.json({
        plates,
        active: menuPlatesResponse[0],
    });
}

export const updateMenuPlate = async (req, res) => {
    const { menuPlateId } = req.params;
    const query = `UPDATE plates SET ? WHERE plate__id = ${menuPlateId}`;
    const response = await database.db.promise().query(query, req.body);
    res.status(201).json({ message: response[0].info })
}

export const getCategories = async (_, res) => {
    const query = 'SELECT * FROM categories';
    const response = await database.db.promise().query(query);
    res.json(response[0]);
}

export const createPlate = async (req, res) => {
    const query = 'INSERT INTO plates SET ?';
    const response = await database.db.promise().query(query, req.body);
    res.status(201).json({ message: response[0] })
}

export const createCategory = async (req, res) => {
    const query = 'INSERT INTO categories SET ?';
    const response = await database.db.promise().query(query, req.body);
    res.status(201).json({ message: response[0] })
}