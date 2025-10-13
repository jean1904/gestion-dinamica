import { db } from '../../config/db.js';

export class UserRepository {
    async findById(userId) {
        const [rows] = await db.query(
            `SELECT id, tenant_id, email, first_name, last_name, role, status, 
                    created_at, updated_at 
            FROM users 
            WHERE id = ? AND deleted_at IS NULL`,
            [userId]
        );
        return rows[0];
    }

    async findByEmail(email, tenantId) {
        const [rows] = await db.query(
            `SELECT * FROM users 
            WHERE email = ? AND tenant_id = ? AND deleted_at IS NULL`,
            [email, tenantId]
        );
        return rows[0];
    }

    async findByTenant(tenantId, filters = {}) {
        let query = `
            SELECT id, tenant_id, email, first_name, last_name, role, status, 
                    created_at, updated_at 
            FROM users 
            WHERE tenant_id = ? AND deleted_at IS NULL
        `;
        const params = [tenantId];

        if (filters.role) {
            query += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.status !== undefined) {
            query += ' AND status = ?';
            params.push(filters.status);
        }

        query += ' ORDER BY created_at DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    async create(userData) {
        const [result] = await db.query(
            `INSERT INTO users (tenant_id, email, password, first_name, last_name, role, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                userData.tenantId,
                userData.email,
                userData.password,
                userData.firstName,
                userData.lastName,
                userData.role,
                userData.status
            ]
        );
        
        return this.findById(result.insertId);
    }

    async update(userId, userData) {
        const fields = [];
        const values = [];

        if (userData.firstName !== undefined) {
            fields.push('first_name = ?');
            values.push(userData.firstName);
        }

        if (userData.lastName !== undefined) {
            fields.push('last_name = ?');
            values.push(userData.lastName);
        }

        if (userData.email !== undefined) {
            fields.push('email = ?');
            values.push(userData.email);
        }

        if (userData.status !== undefined) {
            fields.push('status = ?');
            values.push(userData.status);
        }

        if (userData.password !== undefined) {
            fields.push('password = ?');
            values.push(userData.password);
        }

        if (fields.length === 0) {
            return this.findById(userId);
        }

        fields.push('updated_at = NOW()');
        values.push(userId);

        await db.query(
            `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        return this.findById(userId);
    }

    async softDelete(userId) {
        await db.query(
            'UPDATE users SET deleted_at = NOW() WHERE id = ?',
            [userId]
        );
        return true;
    }

    async existsByEmail(email, tenantId, excludeUserId = null) {
        let query = `SELECT COUNT(*) as count FROM users 
                    WHERE email = ? AND tenant_id = ? AND deleted_at IS NULL`;
        const params = [email, tenantId];

        if (excludeUserId) {
            query += ' AND id != ?';
            params.push(excludeUserId);
        }

        const [rows] = await db.query(query, params);
        return rows[0].count > 0;
    }
}