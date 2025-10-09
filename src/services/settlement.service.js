import Decimal from 'decimal.js';
import { db } from '../config/db.js';
import { getTasa } from '../utils/exchangeRate.util.js';
export async function saveBatchEntry({ items, operatingCosts, tenantId }) {
    let totalCost = new Decimal(0);
    let entries = [];

    // Procesar items
    let { currencyName, value: tasaBcv } = await getTasa(2, tenantId);

    if(tasaBcv === null) {
        throw new Error('Debe actualizar las tasas para la tasa '+ currencyName +'.');
    }
    for (const item of items) {
        const itemId = item.id;
        const currencyId = item.currency_id;
        const entryCost = new Decimal(item.cost);
        const quantity = new Decimal(item.quantity);
        const itemTotal = entryCost.mul(quantity);
        totalCost = totalCost.add(itemTotal);

        let cost_bcv = null;
        if(currencyId == 2) {
            cost_bcv = entryCost.toNumber();
        }else {
            cost_bcv = entryCost.div(tasaBcv).toNumber();
        }
        console.log(cost_bcv,'--- cost bcv')

        entries.push({
            item_id: itemId,
            currency_id: currencyId,
            cost: entryCost.toNumber(),
            quantity: quantity.toNumber(),
            operating_item_name: null, // campo vacío
            cost_bcv: cost_bcv
        });
    }

    // Procesar operatingCosts
    if(operatingCosts.length > 0) {
            for (const cost of operatingCosts) {
                const currencyId = cost.currency_id;
                const entryCost = new Decimal(cost.price);
                const quantity = new Decimal(cost.quantity);
                const itemTotal = entryCost.mul(quantity);
                totalCost = totalCost.add(itemTotal);
                let cost_bcv = null;
                if(currencyId == 2) {
                    cost_bcv = entryCost.toNumber();
                }else {
                    cost_bcv = entryCost.div(tasaBcv).toNumber();
                }
                        
            entries.push({
                item_id: null, // sin item_id
                currency_id: currencyId,
                cost: entryCost.toNumber(),
                quantity: quantity.toNumber(),
                operating_item_name: cost.name,
                cost_bcv: cost_bcv
            });
        }
    }
    
    // Insertar en batch_entries
    const [result] = await db.query(
        'INSERT INTO batch_entries (tenant_id, cost, created_at) VALUES (?, ?, NOW())',
        [tenantId, totalCost.toNumber()]
    );
    const batchEntryId = result.insertId;

    // Insertar en batch_entries_details
    for (const entry of entries) {
        await db.query(
            `INSERT INTO batch_entries_details 
            (batch_entries_id, item_id, currency_id, cost, quantity, operating_item_name, cost_bcv) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                batchEntryId,
                entry.item_id,
                entry.currency_id,
                entry.cost,
                entry.quantity,
                entry.operating_item_name,
                entry.cost_bcv
            ]
        );
    }

    return { batchEntryId };
}
