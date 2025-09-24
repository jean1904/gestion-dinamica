import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getTenantByEmail, createTenant } from '../models/tenant.model.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '2h';

export async function loginTenant(email, password) {
  const tenant = await getTenantByEmail(email);
  if (!tenant) throw new Error('Email no registrado');

  const match = await bcrypt.compare(password, tenant.password);
  if (!match) throw new Error('Contraseña incorrecta');

  const token = jwt.sign(
    {
      id: tenant.id,
      email: tenant.email,
      name: tenant.name,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    tenant: {
      id: tenant.id,
      name: tenant.name,
      email: tenant.email,
    },
  };
}

export async function registerTenant({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const tenant = await createTenant({ name, email, password: hashedPassword });
  return tenant;
}
