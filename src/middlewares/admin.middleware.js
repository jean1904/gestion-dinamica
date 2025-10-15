import { AppError } from '#utils/errorHandler.util.js'; 
export function adminMiddleware(req, res, next) {
  	if (!req.user) {
        return next(new AppError(
            'AUTHENTICATION_ERROR',
            'errors.authentication.unauthorized',
            401
        ));
    }

    if (req.user.role !== 'admin') {
        return next(new AppError(
            'FORBIDDEN_ERROR',
            'errors.authentication.admin_cannot_access_tenant',
            403
        ));
    }
    
    next();
}