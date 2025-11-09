import { db } from '#config/db.js';

export class ItemRepository {
    async findByTenant(tenantId) {
        const query = `
            SELECT 
                id,
                name,
                barcode,
                tenant_id,
                created_at,
                updated_at
            FROM items
            WHERE tenant_id = ? AND deleted_at IS NULL
            ORDER BY name ASC
        `;
        const [rows] = await db.query(query, [tenantId]);
        return rows;
    }

    async findById(itemId, connection = null) {
        const dbToUse = connection || db;
        const [rows] = await dbToUse.query(
            `SELECT id, name, barcode, tenant_id, created_at, updated_at 
            FROM items 
            WHERE id = ? AND deleted_at IS NULL`,
            [itemId]
        );
        return rows[0];
    }
}