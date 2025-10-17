import { db } from '#config/db.js';

export class TenantRepository {
    async findById(tenantId, connection = null) {
        const dbToUse = connection || db;
        const [rows] = await dbToUse.query(
            `SELECT id, name, status, created_at, updated_at 
            FROM tenants 
            WHERE id = ? AND deleted_at IS NULL`,
            [tenantId]
        );
        return rows[0];
    }

    async findAll(filters = {}) {
        let query = `
            SELECT id, name, status, created_at, updated_at 
            FROM tenants 
            WHERE deleted_at IS NULL
        `;
        const params = [];

        if (filters.status !== undefined) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    async create(tenantData, connection = null) {
        const dbToUse = connection || db;
        const [result] = await dbToUse.query(
            `INSERT INTO tenants (name, status) VALUES (?, ?)`,
            [tenantData.name, tenantData.status]
        );
        return this.findById(result.insertId, connection);
    }

    async update(tenantId, tenantData) {
        const fields = [];
        const values = [];

        if (tenantData.name !== undefined) {
            fields.push('name = ?');
            values.push(tenantData.name);
        }

        if (tenantData.status !== undefined) {
            fields.push('status = ?');
            values.push(tenantData.status);
        }

        if (fields.length === 0) {
            return this.findById(tenantId);
        }

        fields.push('updated_at = NOW()');
        values.push(tenantId);

        await db.query(
            `UPDATE tenants SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(tenantId);
    }

    async softDelete(tenantId) {
        await db.query(
            'UPDATE tenants SET deleted_at = NOW() WHERE id = ?',
            [tenantId]
        );
        return true;
    }

}