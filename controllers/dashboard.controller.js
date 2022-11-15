import database from '../database/database.cjs';

const getDatetime = () => {
    const dateRaw = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

    const datePacific = new Date(dateRaw);
    // hours as (HH) format
    const hours = ("0" + datePacific.getHours()).slice(-2);

    // minutes as (mm) format
    const minutes = ("0" + datePacific.getMinutes()).slice(-2);

    // year as (YYYY) format
    const year = datePacific.getFullYear();

    // month as (MM) format
    const month = ("0" + (datePacific.getMonth() + 1)).slice(-2);

    // date as (DD) format
    const day = ("0" + datePacific.getDate()).slice(-2);

    // time as hh:mm:ss format
    return `${year}-${month}-${day} ${hours}:${minutes}:00`;
}

export const getTables = async (_, res) => {
    const query = 'SELECT * FROM tables_info';
    const response = await database.db.promise().query(query);
    res.json(response[0]);
}

export const updateTable = async (req, res) => {
    const { tableId } = req.params;
    const query = `UPDATE tables_info SET ? WHERE table__id = ${tableId}`;
    const response = await database.db.promise().query(query, req.body);
    res.status(201).json({ message: response[0].info })
}

export const createTable = async (req, res) => {
    const { R_USER_NAME, USER_PASSWORD, table__code, table__capacity } = req.body;
    const user = { R_USER_NAME, USER_PASSWORD, USER_ROLE: 'TABLE' }
    const table = { table__code, table__capacity }

    const queryCreateUser = `INSERT INTO tables SET ?`;
    const responseCreateUser = await database.db.promise().query(queryCreateUser, user);

    const queryCreateTable = `INSERT INTO tables_info SET ?`;
    const responseCreateTable = await database.db.promise().query(queryCreateTable, table);

    res.json({
        userCreated: responseCreateUser[0],
        tableCreated: responseCreateTable[0]
    });
}

export const createActivity = async (req, res) => {
    const { tableId } = req.params;
    const body = req.body;
    console.log(body);
    const query = `INSERT INTO tables_activity SET ?, activity__start = '${getDatetime()}'`
    const response = await database.db.promise().query(query, body);

    const queryUpdate = `UPDATE tables_info SET table__isFree = 0, table__lastActivity = ${response[0].insertId} WHERE table__id = ${tableId}`;
    const responseUpdate = await database.db.promise().query(queryUpdate);

    res.json({
        activityCreated: response[0],
        statusUpdated: responseUpdate[0]
    });
}

export const deleteActivity = async (req, res) => {
    const { tableId } = req.params;
    const { lastActivity } = req.body;

    const isReadyQuery = `SELECT * FROM tables_activity WHERE activity__id = ${lastActivity}`;
    const isReadyResponse = await database.db.promise().query(isReadyQuery);

    if(isReadyResponse[0][0].activity__status !== 2)
        return res.status(406).json({
            isReady: isReadyResponse[0][0].activity__status
        });

    const query = `UPDATE tables_info SET table__isFree = 1, table__lastActivity = NULL WHERE table__id = ${tableId}`;
    const response = await database.db.promise().query(query);

    const queryUpdate = `UPDATE tables_activity SET activity__status = 0, activity__end = '${getDatetime()}' WHERE activity__id = ?`
    const responseUpdate = await database.db.promise().query(queryUpdate, lastActivity);

    res.json({
        updated: response[0],
        finished: responseUpdate[0]
    })
} 