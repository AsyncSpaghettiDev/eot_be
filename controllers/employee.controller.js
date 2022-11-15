import database from '../database/database.cjs';

export const getEmployees = async (_, res) => {
    const employeesQuery = `SELECT * FROM users ORDER BY USER_ROLE`;
    const employeesResponse = await database.db.promise().query(employeesQuery);
    /* console.log(employeesResponse[0]); */
    res.json(employeesResponse[0]);
}

export const createEmployee = async (req, res) => {
    const user = req.body;
    const createUserQuery = `INSERT INTO users SET ?`;
    const createUserResponse = await database.db.promise().query(createUserQuery, user);

    console.log(createUserResponse[0]);

    res.json({
        message: "New user created correctly",
    });
}

export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const user = req.body;

    const updateUserQuery = `UPDATE users SET ? WHERE employee__id = ?`;
    await database.db.promise().query(updateUserQuery, [user, id]);

    res.json({
        message: "User updated correctly",
    });
}