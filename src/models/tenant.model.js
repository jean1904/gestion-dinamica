import { db } from '../config/db.js';

// Obtener todos los tenants
export async function getAllTenants() {
  const [rows] = await db.query('SELECT * FROM tenants');
  return rows;
}

// Obtener un tenant por ID
export async function getTenantById(id) {
  const [rows] = await db.query('SELECT * FROM tenants WHERE id = ?', [id]);
  return rows[0];
}

// Actualizar un tenant
export async function updateTenant(id, name) {
  await db.query('UPDATE tenants SET name = ? WHERE id = ?', [name, id]);
  return { id, name };
}

// Eliminar un tenant
export async function deleteTenant(id) {
  await db.query('DELETE FROM tenants WHERE id = ?', [id]);
  return { deleted: true };
}

export async function getTenantByEmail(email) {
  const [rows] = await db.query('SELECT * FROM tenants WHERE email = ?', [email]);
  return rows[0];
}

export async function createTenant({ name, email, password }) {
  const [result] = await db.query(
    'INSERT INTO tenants (name, email, password) VALUES (?, ?, ?)',
    [name, email, password]
  );
  return {
    id: result.insertId,
    name,
    email,
  };
}
