import { db } from '#config/db.js';

export class WarehouseRepository {

    async findByTenant(tenantId) {
        let query = `
            SELECT 
                wa.id,
                wa.tenant_id,
                wa.code,
                wa.name,
                wa.status,
                wa.is_default,
                wa.created_at,
                wa.updated_at
            FROM warehouses wa
            WHERE wa.tenant_id = ?
        `;
        const params = [tenantId];

        query += ' ORDER BY wa.created_at DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

}