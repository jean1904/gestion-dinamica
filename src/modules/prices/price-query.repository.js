import { db } from '#config/db.js';

export class PriceQueryRepository {
    
    async findItemsWithPricesForCalculation(tenantId, filters = {}) {
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const offset = (page - 1) * limit;
        const search = filters.search;

        let query = `
            SELECT 
                i.id,
                i.name AS item_name,
                i.barcode,
                p.id AS price_id,
                p.item_id,
                p.base_currency_id,
                p.price_usd,
                p.price_ves,
                p.price_cash,
                i.created_at,
                i.updated_at
            FROM items i
            INNER JOIN prices p ON i.id = p.item_id AND p.deleted_at IS NULL
            WHERE i.tenant_id = ? 
                AND i.deleted_at IS NULL
        `;

        const params = [tenantId];

        if (search && search.trim() !== '') {
            query += ` AND (i.name LIKE ? OR i.barcode LIKE ?)`;
            const searchParam = `%${search.trim()}%`;
            params.push(searchParam, searchParam);
        }

        query += ` ORDER BY i.name ASC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        const [rows] = await db.query(query, params);

        const countQuery = `
            SELECT COUNT(DISTINCT i.id) as total
            FROM items i
            INNER JOIN prices p ON i.id = p.item_id AND p.deleted_at IS NULL
            WHERE i.tenant_id = ? 
                AND i.deleted_at IS NULL
                ${search && search.trim() !== '' ? 'AND (i.name LIKE ? OR i.barcode LIKE ?)' : ''}
        `;
        
        let countParams = [tenantId];
        if (search && search.trim() !== '') {
            const searchParam = `%${search.trim()}%`;
            countParams.push(searchParam, searchParam);
        }

        const [[{ total }]] = await db.query(countQuery, countParams);

        return {
            items: rows,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit)
        };
    }

 
    async findAllItemsWithPricesForCalculation(tenantId, filters = {}) {
        const excludeItemIds = filters.exclude_item_ids;

        let query = `
            SELECT 
                i.id,
                i.name AS item_name,
                i.barcode,
                p.id AS price_id,
                p.item_id,
                p.base_currency_id,
                p.price_usd,
                p.price_ves,
                p.price_cash,
                i.created_at,
                i.updated_at
            FROM items i
            INNER JOIN prices p ON i.id = p.item_id AND p.deleted_at IS NULL
            WHERE i.tenant_id = ? 
                AND i.deleted_at IS NULL
        `;

        const params = [tenantId];

         if (excludeItemIds && excludeItemIds.length > 0) {
            const placeholders = excludeItemIds.map(() => '?').join(',');
            query += ` AND i.id NOT IN (${placeholders})`;
            params.push(...excludeItemIds);
        }

        query += ` ORDER BY i.name ASC`;

        const [rows] = await db.query(query, params);

        return rows;
    }
}