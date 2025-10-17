import { db } from '#config/db.js';

export class PermissionRepository {
    async findByUserId(userId) {
        const [rows] = await db.query(
            'SELECT * FROM permissions WHERE user_id = ? ORDER BY module, action',
            [userId]
        );
        return rows;
    }

    async findOne(userId, module, action) {
        const [rows] = await db.query(
        'SELECT * FROM permissions WHERE user_id = ? AND module = ? AND action = ?',
        [userId, module, action]
        );
        return rows[0];
    }

    async create(permissionData) {
        const [result] = await db.query(
            'INSERT INTO permissions (user_id, module, action, granted) VALUES (?, ?, ?, ?)',
            [permissionData.userId, permissionData.module, permissionData.action, permissionData.granted]
        );
        return this.findOne(permissionData.userId, permissionData.module, permissionData.action);
    }

    async update(userId, module, action, granted) {
        await db.query(
            'UPDATE permissions SET granted = ?, updated_at = NOW() WHERE user_id = ? AND module = ? AND action = ?',
            [granted, userId, module, action]
        );
        return this.findOne(userId, module, action);
    }

    async upsert(permissionData) {
        await db.query(
            `INSERT INTO permissions (user_id, module, action, granted) 
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE granted = VALUES(granted), updated_at = NOW()`,
            [permissionData.userId, permissionData.module, permissionData.action, permissionData.granted]
        );
        return this.findOne(permissionData.userId, permissionData.module, permissionData.action);
    }

    async deleteByUserId(userId) {
        await db.query('DELETE FROM permissions WHERE user_id = ?', [userId]);
        return true;
    }

    async deleteOne(userId, module, action) {
        await db.query(
            'DELETE FROM permissions WHERE user_id = ? AND module = ? AND action = ?',
            [userId, module, action]
        );
        return true;
    }

    async setUserPermissions(userId, permissions) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            await connection.query('DELETE FROM permissions WHERE user_id = ?', [userId]);

            if (permissions.length > 0) {
                const values = permissions.map(p => [userId, p.module, p.action, p.granted]);
                await connection.query(
                    'INSERT INTO permissions (user_id, module, action, granted) VALUES ?',
                    [values]
                );
            }

            await connection.commit();
            return this.findByUserId(userId);
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async checkUserPermission(userId, tenantId, module, action) {
        const [rows] = await this.db.query(
            `SELECT id 
             FROM permissions 
             WHERE user_id = ? 
               AND tenant_id = ?
               AND module = ? 
               AND action = ? 
               AND granted = true
             LIMIT 1`,
            [userId, tenantId, module, action]
        );

        return rows.length > 0;
    }

    async getUserPermissions(userId, tenantId) {
        const [rows] = await this.db.query(
            `SELECT module, action, granted 
             FROM permissions 
             WHERE user_id = ? AND tenant_id = ?`,
            [userId, tenantId]
        );

        return rows;
    }
}