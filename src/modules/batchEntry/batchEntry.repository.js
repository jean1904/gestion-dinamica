import { db } from '#config/db.js';

export class BatchEntryRepository {

    async findByTenant(tenantId, filters = {}) {
        let query = `
            SELECT 
                be.id,
                be.tenant_id,
                be.created_at,
                be.created_by,
                TRIM(CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, ''))) as created_by_fullname,
                u.email as created_by_email
            FROM batch_entries be
            LEFT JOIN users u ON be.created_by = u.id
            WHERE be.tenant_id = ?
        `;
        const params = [tenantId];

        query += ' ORDER BY be.created_at DESC';

        const [rows] = await db.query(query, params);
        return rows;
    }

    async findById(tenant_id, id) {
        const query = `
            SELECT 
                be.id,
                be.tenant_id,
                be.created_at,
                be.created_by,
                TRIM(CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, ''))) as created_by_fullname,
                u.email as created_by_email
            FROM batch_entries be
            LEFT JOIN users u ON be.created_by = u.id
            WHERE be.id = ? AND be.tenant_id = ?
        `;
        
        const [rows] = await db.query(query, [id, tenant_id]);
        return rows[0] || null;
    }

    async findItemsByBatchEntryId(batch_entry_id) {
        const query = `
            SELECT 
                bei.id,
                bei.item_id,
                bei.quantity,
                bei.unit_price,
                bei.currency_id,
                c.code AS currency_code,
                i.name AS item_name,
                i.description AS item_description,
                i.barcode AS item_barcode,
                i.unit_type AS item_unit_type
            FROM batch_entry_items bei
            INNER JOIN items i ON bei.item_id = i.id
            INNER JOIN currencies c ON bei.currency_id = c.id
            WHERE bei.batch_entry_id = ?
            ORDER BY bei.id ASC
        `;
        
        const [rows] = await db.query(query, [batch_entry_id]);
        return rows;
    }

    async findCostsByBatchEntryId(batch_entry_id) {
        const query = `
            SELECT 
                bec.id,
                bec.name,
                bec.amount,
                bec.currency_id,
                c.code AS currency_code
            FROM batch_entry_costs bec
            INNER JOIN currencies c ON bec.currency_id = c.id
            WHERE bec.batch_entry_id = ?
            ORDER BY bec.id ASC;
        `;
        
        const [rows] = await db.query(query, [batch_entry_id]);
        return rows;
    }

    async findByIdComplete(tenant_id, id) {
        const batchEntry = await this.findById(tenant_id, id);
        
        if (!batchEntry) {
            return null;
        }
        
        // Ejecutar en paralelo para mejor performance
        const [items, costs] = await Promise.all([
            this.findItemsByBatchEntryId(id),
            this.findCostsByBatchEntryId(id)
        ]);
        
        batchEntry.items = items;
        batchEntry.costs = costs;
        
        return batchEntry;
    }
   
    async create(data, connection = null) {
        const db = connection || this.db;
        const [result] = await db.query(
            'INSERT INTO batch_entries (tenant_id, warehouse_id,  created_by, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
            [data.tenantId, data.warehouseId, data.createdBy]
        );
        return { id: result.insertId, ...data };
    }

    async createItem(data, connection = null) {
        const db = connection || this.db;
        const [result] = await db.query(
            'INSERT INTO batch_entry_items (batch_entry_id, item_id, quantity, unit_price, currency_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
            [data.batchEntryId, data.itemId, data.quantity, data.unitPrice, data.currencyId]
        );
        return { id: result.insertId, ...data };
    }

    async createCost(data, connection = null) {
        const db = connection || this.db;
        const [result] = await db.query(
            'INSERT INTO batch_entry_costs (batch_entry_id, currency_id, name, amount, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())',
            [data.batchEntryId, data.currencyId, data.name, data.amount]
        );
        return { id: result.insertId, ...data };
    }
    
}
