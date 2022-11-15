import database from '../database/database.cjs';

export const getOrders = async (_, res) => {
    const ordered = [];
    const cooking = [];
    const readyToGo = [];

    const tOrders = [ordered, cooking, readyToGo];

    const ordersQuery = `
    SELECT * FROM orders 
    JOIN plates 
    ON orders.plate__id = plates.plate__id
    WHERE orders.order__status != 4
    ORDER BY order__datetime ASC,order__status ASC
    `;
    const orders = await database.db.promise().query(ordersQuery);

    orders[0].forEach((order) => {
        tOrders[order.order__status - 1].push(order);
    });

    res.json({
        message: 'Orders fetched successfully',
        ordered,
        cooking,
        readyToGo,
    });
}

export const updateOrderStatus = async (req, res) => {
    const { order_id } = req.params;
    const { status } = req.body;
    const updateOrderQuery = `
    UPDATE orders
    SET order__status = ?
    WHERE order__id = ?
    `;
    await database.db.promise().query(updateOrderQuery, [status, order_id]);
    res.json({
        message: 'Order status updated successfully',        
    });
}
