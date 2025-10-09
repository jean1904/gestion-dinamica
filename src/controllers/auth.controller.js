import { loginTenant, registerTenant, emailExists } from '../services/auth.service.js';

import { AppError, logUnhandledError } from '../utils/errorHandler.util.js';
export async function loginHandler(req, res, next) {
  try {
    const { email, password } = req.body;
    const tenant = await loginTenant(email, password);
    res.json({ tenant });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Error no manejable
    logUnhandledError(error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error inesperado del servidor',
      },
    });
  }
}

export async function registerHandler(req, res) {
  try {
    const { name, email, password, firstName, lastName } = req.body;
    if (!name || !email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const alreadyExists = await emailExists({ email });

    if(alreadyExists) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const tenant = await registerTenant({ name, email, password, firstName, lastName });
    res.status(201).json({ tenant });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Error no manejable
    logUnhandledError(error);
    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error inesperado del servidor',
      },
    });
  }
}
