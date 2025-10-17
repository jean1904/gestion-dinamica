import { AppError } from '#utils/AppError.js';
import { PermissionRepository } from '#modules/permissions/permission.repository.js';

const permissionRepository = new PermissionRepository();

export function checkPermission(module, action) {
    return async (req, res, next) => {
        try {
            const user = req.user;

            if (user.role === 'manager') {
                return next();
            }

            if (user.role === 'admin') {
                throw new AppError(
                    'FORBIDDEN_ERROR',
                    'errors.forbidden.admin_no_permission',
                );
            }

            const hasPermission = await permissionRepository.checkUserPermission(
                user.id,
                user.tenantId,
                module,
                action
            );

            if (!hasPermission) {
                throw new AppError(
                    'FORBIDDEN_ERROR',
                    'errors.permission.access_denied',
                    null,
                    { module, action }
                );
            }

            next();
        } catch (error) {
            next(error); 
        }
    };
}