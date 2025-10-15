import { AppError } from '#utils/errorHandler.util.js'; 
export function tenantMiddleware(req, res, next) {
    if (!req.user) {
        return next(new AppError(
            'AUTHENTICATION_ERROR',
            'errors.authentication.unauthorized',
            401
        ));
    }

    if (req.user.role === 'admin') {
        return next(new AppError(
            'FORBIDDEN_ERROR',
            'errors.authentication.admin_cannot_access_tenant',
            403
        ));
    }
    
    next();
}

export function managerMiddleware(req, res, next) {
    if (!req.user) {
        return next(new AppError(
            'AUTHENTICATION_ERROR',
            'errors.authentication.unauthorized',
            401
        ));
    }

    if (req.user.role !== 'manager') {
        return next(new AppError(
            'FORBIDDEN_ERROR',
            'errors.authentication.only_managers',
            403
        ));
    }
  
    next();
}