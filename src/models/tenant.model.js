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

export async function createTenant({ name, email, password, firstName, lastName }) {
  // Crear el tenant solo con el nombre
  const [tenantResult] = await db.query(
    'INSERT INTO tenants (name) VALUES (?)',
    [name]
  );
  const tenantId = tenantResult.insertId;

  // Crear el usuario manager asociado al tenant
  await db.query(
    'INSERT INTO users (tenant_id, email, password, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [tenantId, email, password, firstName, lastName, 'manager', 1]
  );

  return {
    id: tenantId,
    name,
    manager: {
      email,
      firstName,
      lastName,
      role: 'manager',
      status: 1
    }
  };
}
