import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createTenant } from '../models/tenant.model.js';
import { getUserByEmail } from '../models/user.model.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '10h';

export async function loginTenant(email, password) {
  const user = await getUserByEmail(email);
  if (!user) throw new Error('Email o contraseña incorrectos');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Email o contraseña incorrectos');

  const token = jwt.sign(
    {
      tenant: {
        id: user.tenant_id,
        name: user.name,
      },
      user: {
        id: user.user_id,
        email: user.email,
      }
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return {
    token,
    tenant: {
      id: user.tenant_id,
      name: user.name,
    },
    user: {
      id: user.user_id,
      email: user.email,
    }
  };
}

export async function registerTenant({ name, email, password }) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const tenant = await createTenant({ name, email, password: hashedPassword });
  return tenant;
}
export async function emailExists({ email }) {
  const tenant = await getUserByEmail(email);
  return !!tenant;
}
