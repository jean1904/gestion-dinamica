import { db } from '../config/db.js';

export async function getUserByEmail(email) {
  const [rows] = await db.query(`SELECT
      t1.email,
      t1.role,
      t1.first_name,
      t1.last_name,
      t2.name,
      t2.id as tenant_id,
      t1.id as user_id,
      t1.password
    FROM users t1
    LEFT JOIN tenants t2 ON t1.tenant_id = t2.id
    WHERE t1.email = ?`, [email]);
  return rows[0];
}
