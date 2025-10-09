import { db } from '../config/db.js';

export async function getTasa(currencyId, tenantId) {
    const [currency] = await db.query(
        `SELECT name
         FROM currencies
            WHERE id = ?`,
        [currencyId]
    );
    const [rows] = await db.query(
        `SELECT er.value 
         FROM exchange_rate er
            WHERE er.currency_id = ? AND er.tenant_id = ?
            AND er.valid_from = (
                SELECT MAX(e.valid_from)
                FROM exchange_rate e
                WHERE e.currency_id = ? AND e.tenant_id = ?
            )`,
        [currencyId, tenantId, currencyId, tenantId]
    );

    let value = rows.length > 0 ? rows[0].value : null;

    return {currencyName: currency[0].name, value};
}