// utils/errorHandler.util.js

export const ERROR_TYPES = {
  VALIDATION_ERROR: {
    code: 'VALIDATION_ERROR',
    message: 'Datos inválidos',
    statusCode: 400,
  },
  AUTHENTICATION_ERROR: {
    code: 'AUTHENTICATION_ERROR',
    message: 'No autorizado',
    statusCode: 401,
  },
  NOT_FOUND_ERROR: {
    code: 'NOT_FOUND_ERROR',
    message: 'Recurso no encontrado',
    statusCode: 404,
  },
  CONFLICT_ERROR: {
    code: 'CONFLICT_ERROR',
    message: 'Conflicto en los datos',
    statusCode: 409,
  },
  INTERNAL_ERROR: {
    code: 'INTERNAL_ERROR',
    message: 'Error interno del servidor',
    statusCode: 500,
  },
};

// Clase para errores manejables
export class AppError extends Error {
  constructor(typeKey, customMessage = null) {
    const type = ERROR_TYPES[typeKey] || ERROR_TYPES.INTERNAL_ERROR;
    super(customMessage || type.message);
    this.name = 'AppError';
    this.code = type.code;
    this.statusCode = type.statusCode;
    this.isHandled = true;
  }
}

// Utilidad para logging de errores no manejables
export const logUnhandledError = (error) => {
  console.error('🔴 Error no manejado:', error);
};
