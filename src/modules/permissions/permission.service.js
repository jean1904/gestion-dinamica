export class PermissionService {
    constructor(permissionRepository, userRepository) {
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    async getUserPermissions(userId, requestingUser) {
        try {
            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            if (user.tenant_id !== requestingUser.tenant_id) {
                throw new Error('Acceso Denegado');
            }

            if (user.role !== 'user') {
                throw new Error('Solo se pueden obtener permisos para el rol "user"');
            }

            const permissions = await this.permissionRepository.findByUserId(userId);
            return this.formatPermissions(permissions);
        } catch (error) {
            throw error;
        }
    }

    async setUserPermissions(userId, permissions, requestingUser) {
        try {
            if (requestingUser.role !== 'manager') {
                throw new Error('Only managers can set permissions');
            }

            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            if (user.tenant_id !== requestingUser.tenant_id) {
                throw new Error('Acceso Denegado');
            }

            if (user.role !== 'user') {
                throw new Error('Solo se pueden establecer permisos para el rol "user"');
            }

            this.validatePermissions(permissions);

            const updatedPermissions = await this.permissionRepository.setUserPermissions(
                userId, 
                permissions
            );

            return this.formatPermissions(updatedPermissions);
        } catch (error) {
            throw error;
        }
    }

    validatePermissions(permissions) {
        const validModules = ['sales', 'inventory', 'items', 'customers', 'suppliers', 'reports'];
        const validActions = ['create', 'read', 'update', 'delete', 'export'];

        for (const perm of permissions) {
            if (!validModules.includes(perm.module)) {
                throw new Error(`Invalid module: ${perm.module}`);
            }
            if (!validActions.includes(perm.action)) {
                throw new Error(`Invalid action: ${perm.action}`);
            }
            if (typeof perm.granted !== 'boolean') {
                throw new Error('granted must be a boolean');
            }
        }
    }

    formatPermissions(permissions) {
        const grouped = {};
        
        permissions.forEach(perm => {
            if (!grouped[perm.module]) {
                grouped[perm.module] = {};
            }
            grouped[perm.module][perm.action] = perm.granted;
        });

        return {
            userId: permissions[0]?.user_id || null,
            permissions: grouped
        };
    }
}