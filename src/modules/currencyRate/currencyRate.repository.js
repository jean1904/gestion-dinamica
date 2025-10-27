import { db } from '#config/db.js';

export class CurrencyRateRepository {
    async findTodayRates(tenantId, connection = null) {
        const dbToUse = connection || db;
        
        const [rows] = await dbToUse.query(
            `SELECT 
                cr.id,
                cr.tenant_id,
                cr.currency_id,
                cr.value,
                cr.valid_from,
                c.code,
                c.name,
                c.symbol
            FROM exchange_rate cr
            JOIN currencies c ON cr.currency_id = c.id
            WHERE cr.tenant_id = ? 
            AND DATE(cr.valid_from) = CURDATE()
            ORDER BY c.code`,
            [tenantId]
        );
        return rows;
    }

    async upsertRate(tenantId, currencyId, value, connection = null) {
        const dbToUse = connection || db;
        
        await dbToUse.query(
            `INSERT INTO exchange_rate (tenant_id, currency_id, value, valid_from)
            VALUES (?, ?, ?, CURDATE())
            ON DUPLICATE KEY UPDATE 
                value = VALUES(value)`,
            [tenantId, currencyId, value]
        );
    }
}