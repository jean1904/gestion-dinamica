import { db } from '#config/db.js';
export class InventoryRepository {
    
    async findByWarehouseAndItem(warehouseId, itemId, connection = null) {
        const dbToUse = connection || db;
        const [rows] = await dbToUse.query(
            'SELECT * FROM inventory WHERE warehouse_id = ? AND item_id = ?',
            [warehouseId, itemId]
        );
        return rows[0];
    }

    async updateQuantity(warehouseId, itemId, newQuantity, connection = null) {
        const dbToUse = connection || db;
        await dbToUse.query(
            'UPDATE inventory SET quantity = ?, updated_at = NOW() WHERE warehouse_id = ? AND item_id = ?',
            [newQuantity, warehouseId, itemId]
        );
    }

    async create(data, connection = null) {
        const dbToUse = connection || db;
        const [result] = await dbToUse.query(
            'INSERT INTO inventory (warehouse_id, item_id, quantity, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [data.warehouseId, data.itemId, data.quantity]
        );
        return { id: result.insertId, ...data };
    }

}