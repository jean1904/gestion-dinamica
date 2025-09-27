import { db } from '../config/db.js';

// Obtener todos los items
export async function getAllItems(tenantId) {
  const [rows] = await db.query(`SELECT 
        t1.*,
        t2.cost,
        t2.valid_from AS price_valid_from,
        c.code AS currency_code,
        c.name AS currency_name,
        c.symbol AS currency_symbol,
        er.value AS exchange_rate,
        er.valid_from AS exchange_rate_valid_from,
        t2.cost * er.value AS price_ves,

        -- Tasa de cambio para operating_currency_id
        ero.value AS operating_exchange_rate,
        ero.valid_from AS operating_exchange_rate_valid_from,
        t2.operating_cost * ero.value AS operating_cost_ves,

        -- Aplicar porcentaje de ganancia y sumar operating_cost en VES
        CASE 
            WHEN t1.profit_percentage > 0 THEN 
                (t2.cost * er.value * (1 + t1.profit_percentage / 100)) + (t2.operating_cost * ero.value)
            ELSE 
                (t2.cost * er.value * (1 + tn.profit_percentage / 100)) + (t2.operating_cost * ero.value)
        END AS price_ves_with_profit
    FROM items t1
    LEFT JOIN prices t2 ON t2.item_id = t1.id
        AND t2.valid_from = (
            SELECT MAX(p.valid_from)
            FROM prices p
            WHERE p.item_id = t1.id
        )
    LEFT JOIN currencies c ON c.id = t2.currency_id
    LEFT JOIN exchange_rate er ON er.currency_id = t2.currency_id AND er.tenant_id = t1.tenant_id
        AND er.valid_from = (
            SELECT MAX(e.valid_from)
            FROM exchange_rate e
            WHERE e.currency_id = t2.currency_id AND e.tenant_id = t1.tenant_id
        )
    -- Nueva unión para tasa de cambio de operating_currency_id
    LEFT JOIN exchange_rate ero ON ero.currency_id = t2.operating_currency_id AND ero.tenant_id = t1.tenant_id
        AND ero.valid_from = (
            SELECT MAX(eo.valid_from)
            FROM exchange_rate eo
            WHERE eo.currency_id = t2.operating_currency_id AND eo.tenant_id = t1.tenant_id
        )
    LEFT JOIN tenants tn ON tn.id = t1.tenant_id
    WHERE t1.deleted_at IS NULL AND t1.tenant_id = ?
    ORDER BY t1.id DESC`, [tenantId]);
  return rows;
}

// Obtener un item por ID
export async function getItemById(id, tenantId) {
  const [rows] = await db.query(`SELECT 
        t1.*,
        t2.cost,
        t2.valid_from AS price_valid_from,
        c.code AS currency_code,
        c.name AS currency_name,
        c.symbol AS currency_symbol,
        er.value AS exchange_rate,
        er.valid_from AS exchange_rate_valid_from,
        t2.cost * er.value AS price_ves,

        -- Tasa de cambio para operating_currency_id
        ero.value AS operating_exchange_rate,
        ero.valid_from AS operating_exchange_rate_valid_from,
        t2.operating_cost * ero.value AS operating_cost_ves,

        -- Aplicar porcentaje de ganancia y sumar operating_cost en VES
        CASE 
            WHEN t1.profit_percentage > 0 THEN 
                (t2.cost * er.value * (1 + t1.profit_percentage / 100)) + (t2.operating_cost * ero.value)
            ELSE 
                (t2.cost * er.value * (1 + tn.profit_percentage / 100)) + (t2.operating_cost * ero.value)
        END AS price_ves_with_profit
    FROM items t1
    LEFT JOIN prices t2 ON t2.item_id = t1.id
        AND t2.valid_from = (
            SELECT MAX(p.valid_from)
            FROM prices p
            WHERE p.item_id = t1.id
        )
    LEFT JOIN currencies c ON c.id = t2.currency_id
    LEFT JOIN exchange_rate er ON er.currency_id = t2.currency_id AND er.tenant_id = t1.tenant_id
        AND er.valid_from = (
            SELECT MAX(e.valid_from)
            FROM exchange_rate e
            WHERE e.currency_id = t2.currency_id AND e.tenant_id = t1.tenant_id
        )
    -- Nueva unión para tasa de cambio de operating_currency_id
    LEFT JOIN exchange_rate ero ON ero.currency_id = t2.operating_currency_id AND ero.tenant_id = t1.tenant_id
        AND ero.valid_from = (
            SELECT MAX(eo.valid_from)
            FROM exchange_rate eo
            WHERE eo.currency_id = t2.operating_currency_id AND eo.tenant_id = t1.tenant_id
        )
    LEFT JOIN tenants tn ON tn.id = t1.tenant_id
    WHERE t1.deleted_at IS NULL AND t1.id = ? AND t1.tenant_id = ?
    ORDER BY t1.id DESC`, [id, tenantId]);
  return rows[0];
}

// Crear un nuevo item
export async function createItem({ name, barcode, tenantId }) {
    if(barcode === '') barcode = null;
    const [result] = await db.query(
        'INSERT INTO items (name, barcode, tenant_id, created_at) VALUES (?, ?, ?, NOW())',
    [name, barcode, tenantId]
    );
    return {
        id: result.insertId,
        name,
        barcode,
        tenantId,
    };
}

// Actualizar un item
export async function updateItem(id, { name, barcode, tenantId }) {
    if(barcode === '') barcode = null;
    await db.query('UPDATE items SET name = ?, barcode = ?, updated_at = NOW() WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [name, barcode, id, tenantId]);
    return { id, name, barcode, tenantId };
}

// Eliminación lógica de un item
export async function deleteItem(id, tenantId) {
    await db.query('UPDATE items SET deleted_at = NOW() WHERE id = ? AND tenant_id = ?', [id, tenantId]);
    return { deleted: true };
}

// Buscar item por código de barras
export async function searchItemByBarcode(barcode, tenantId) {
  const [rows] = await db.query('SELECT * FROM items WHERE barcode LIKE ? AND deleted_at IS NULL AND tenant_id = ?', [`%${barcode}%`, tenantId]);
  return rows;
}

// Buscar item por nombre
export async function searchItemByName(name, tenantId) {
  const [rows] = await db.query('SELECT * FROM items WHERE name LIKE ? AND deleted_at IS NULL AND tenant_id = ?', [`%${name}%`, tenantId]);
  return rows;
}
