import { db } from '../config/db.js';

// Obtener todos los items
export async function getAllItems(tenantId) {
  const [rows] = await db.query('SELECT * FROM items WHERE deleted_at IS NULL AND tenant_id = ?', [tenantId]);
  return rows;
}

// Obtener un item por ID
export async function getItemById(id, tenantId) {
  const [rows] = await db.query('SELECT * FROM items WHERE id = ? AND deleted_at IS NULL AND tenant_id = ?', [id, tenantId]);
  return rows[0];
}

// Crear un nuevo item
export async function createItem({ name, barcode, tenantId }) {
  const [result] = await db.query(
    'INSERT INTO items (name, barcode, tenant_id) VALUES (?, ?, ?)',
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
  await db.query('UPDATE items SET name = ?, barcode = ? WHERE id = ? AND tenant_id = ? AND deleted_at IS NULL', [name, barcode, id, tenantId]);
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
