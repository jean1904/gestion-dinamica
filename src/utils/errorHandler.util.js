export class AppError extends Error {
	constructor(code, messageKey, statusCode = null, params = {}) {
		super(messageKey);
		this.code = code;
		this.messageKey = messageKey;
		this.params = params; 
		this.statusCode = statusCode || this.getStatusCode(code);
		this.isHandled = true;
	}

	getStatusCode(code) {
		const statusCodes = {
			'VALIDATION_ERROR': 400,
			'AUTHENTICATION_ERROR': 401,
			'FORBIDDEN_ERROR': 403,
			'NOT_FOUND_ERROR': 404,
			'CONFLICT_ERROR': 409,
			'INTERNAL_ERROR': 500
		};
		return statusCodes[code] || 500;
	}
}
export const logUnhandledError = (error) => {
  console.error('🔴 Error no manejado:', error);
};