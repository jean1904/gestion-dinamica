import { AppError } from '#utils/errorHandler.util.js';

export class PermissionService {
    constructor(permissionRepository, userRepository) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    async getUserPermissions(userId, requestingUser) {
        await this.validateUserAccess(userId, requestingUser);

        const permissions = await this.permissionRepository.findByUserId(userId);
        return this.formatPermissions(permissions, userId);
    }

    async setUserPermissions(userId, permissions, requestingUser) {
        this.validateManagerRole(requestingUser);
        
        await this.validateUserAccess(userId, requestingUser);

        this.validatePermissions(permissions);

        const updatedPermissions = await this.permissionRepository.setUserPermissions(
            userId, 
            permissions
        );

        return this.formatPermissions(updatedPermissions, userId);
    }

    validateManagerRole(user) {
        if (user.role !== 'manager') {
            throw new AppError(
                'FORBIDDEN_ERROR',
                'errors.forbidden.only_managers'
            );
        }
    }

    async validateUserAccess(userId, requestingUser) {
        const user = await this.userRepository.findById(userId);
        
        if (!user) {
            throw new AppError(
                'NOT_FOUND_ERROR',
                'errors.not_found.user'
            );
        }

        if (user.tenant_id !== requestingUser.tenant_id) {
            throw new AppError(
                'FORBIDDEN_ERROR',
                'errors.forbidden.different_tenant'
            );
        }

        if (user.role !== 'user') {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.permission.only_user_role'
            );
        }

        return user;
    }

    validatePermissions(permissions) {
        const validModules = ['sales', 'inventory', 'items', 'customers', 'suppliers', 'reports'];
        const validActions = ['create', 'read', 'update', 'delete', 'export'];

        if (!Array.isArray(permissions) || permissions.length === 0) {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.permission.empty_array'
            );
        }

        for (const perm of permissions) {
            if (!validModules.includes(perm.module)) {
                throw new AppError(
                    'VALIDATION_ERROR',
                    'errors.permission.invalid_module',
                    null,
                    { module: perm.module }
                );
            }
            if (!validActions.includes(perm.action)) {
                throw new AppError(
                    'VALIDATION_ERROR',
                    'errors.permission.invalid_action',
                    null,
                    { action: perm.action }
                );
            }
            if (typeof perm.granted !== 'boolean') {
                throw new AppError(
                    'VALIDATION_ERROR',
                    'errors.permission.granted_not_boolean'
                );
            }
        }
    }

    formatPermissions(permissions, userId = null) {
        if (!permissions || permissions.length === 0) {
            return {
                userId: userId,
                permissions: {}
            };
        }

        const grouped = {};
        
        permissions.forEach(perm => {
            if (!grouped[perm.module]) {
                grouped[perm.module] = {};
            }
            grouped[perm.module][perm.action] = perm.granted;
        });

        return {
            userId: permissions[0]?.user_id || userId,
            permissions: grouped
        };
    }
}