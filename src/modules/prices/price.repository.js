import { db } from '#config/db.js';

export class PriceRepository {
    
    async bulkUpdate(tenantId, items, connection = null) {
        if (!Array.isArray(items) || items.length === 0) {
            return { affectedRows: 0 };
        }

        const dbToUse = connection || db;
        const validPrices = items.filter(item => item.id);

        if (validPrices.length === 0) {
            return { affectedRows: 0 };
        }

        const ids = validPrices.map(i => i.id);
        const placeholders = ids.map(() => '?').join(', ');

        const buildCaseForField = (field) =>
            `${field} = CASE id ${validPrices.map(() => 'WHEN ? THEN ?').join(' ')} END`;

        const query = `
            UPDATE prices
            SET
                ${buildCaseForField('price_usd')},
                ${buildCaseForField('price_ves')},
                ${buildCaseForField('price_cash')},
                updated_at = CURRENT_TIMESTAMP
            WHERE tenant_id = ?
            AND id IN (${placeholders})
        `;

        const params = [];
        const fields = ['price_usd', 'price_ves', 'price_cash'];
        fields.forEach(field => {
            validPrices.forEach(item => {
                params.push(item.id);
                params.push(item[field] ?? null);
            });
        });

        params.push(tenantId, ...ids);

        const [result] = await dbToUse.query(query, params);
        return result;
    }
}