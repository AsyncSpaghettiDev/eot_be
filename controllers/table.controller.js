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

export const getTableOrder = async (req, res) => {
    /**
        Proceso para consultar una mesa
        1. Se muestra el dashboard
        2. Al clickear se muestra la pantalla
        3. Al cargar se busca en la tabla info la actividad pendiente
        3.1 En caso que no haya actividad activa se envia un 404 para evitar que consulte la página
        4. Con el id de la actividad se consulta todas las ordenes
        5. Se regresan todos las ordenes de esa actividad
     */
    const { tableId } = req.params;

    const activityQuery = 'SELECT table__lastActivity FROM tables_info WHERE table__code = ?';
    const activityResponse = await database.db.promise().query(activityQuery, tableId);

    const currentActivity = activityResponse[0][0].table__lastActivity;

    if (currentActivity == null)
        return res.status(412).json({
            message: "error"
        });

    const currentActivityQuery = `
    SELECT *, CONVERT_TZ(activity__start, '+00:00', '-07:00') as parsed__activity__start,
    CONVERT_TZ(activity__end, '+00:00', '-07:00') as parsed__activity__end 
    FROM tables_activity 
    WHERE activity__id = ?`
    const currentActivityResponse = await database.db.promise().query(currentActivityQuery, currentActivity);

    const ordersQuery = `
    SELECT * FROM orders 
    INNER JOIN plates
    ON orders.plate__id = plates.plate__id
    WHERE table_order_id = ?`;
    const ordersResponse = await database.db.promise().query(ordersQuery, currentActivity);

    const initial = new Date(currentActivityResponse[0][0].activity__start);
    const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
    const final = new Date(currentActivityResponse[0][0].activity__end ?? now);

    const cur = getDatetime();
    const newT = new Date(cur);
    // console.log(newT.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));

    const elapsed = final - initial;
    const elapsedHours = Math.floor(elapsed / (1000 * 60 * 60));
    const elapsedMinutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));

    // console.log(`${elapsedHours}:${elapsedMinutes}`);

    res.json({
        message: 'All is fine, here is all the info',
        activityId: currentActivity,
        activityInfo: {
            ...currentActivityResponse[0][0],
            elapsedHours,
            elapsedMinutes
        },
        orders: ordersResponse[0],
    });
}

export const getOrder = async (req, res) => {
    const { orderId } = req.params;

    const ordersQuery = `
    SELECT * , CONVERT_TZ(order__datetime, '+00:00', '-07:00') as order__datetime
    FROM orders
    INNER JOIN plates
    ON orders.plate__id = plates.plate__id
    WHERE order__id = ?`;
    const ordersResponse = await database.db.promise().query(ordersQuery, orderId);

    res.json({
        ...ordersResponse[0][0]
    });
}

export const getCheck = async (req, res) => {
    const { activityId } = req.params;

    // Validate if the activity does not has actives orders
    const activeOrdersQuery = 'SELECT * FROM orders WHERE table_order_id = ? AND order__status != 4';
    const activeOrdersResponse = await database.db.promise().query(activeOrdersQuery, activityId);

    if (activeOrdersResponse[0].length !== 0)
        return res.status(406).json({
            isReady: activeOrdersResponse[0]
        });

    const checkQuery = `UPDATE tables_activity SET activity__status = 2, activity__end = '${getDatetime()}' WHERE activity__id = ?`;
    const checkResponse = await database.db.promise().query(checkQuery, parseInt(activityId));
    res.json(checkResponse[0]);
}

export const createOrder = async (req, res) => {
    const { body } = req;
    const { plate__id } = body;

    const order = {
        ...body,
        order__datetime: getDatetime()
    }

    const newOrderQuery = 'INSERT INTO orders SET ?';
    const newOrderResponse = await database.db.promise().query(newOrderQuery, order);

    const plateNameQuery = 'SELECT plate__name FROM plates WHERE plate__id = ?';
    const plateName = await database.db.promise().query(plateNameQuery, plate__id);
    const plate__name = plateName[0][0];

    res.json({
        orderInfo: {
            ...order,
            ...plate__name,
            order__id: newOrderResponse[0].insertId
        },
        insertedInfo: newOrderResponse[0]
    });
}