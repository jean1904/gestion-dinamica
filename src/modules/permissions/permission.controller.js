export class PermissionController {
    constructor(permissionService) {
        this.permissionService = permissionService;
    }

    async getUserPermissions(req, res, next) {
        try {
            const { userId } = req.params;
            const requestingUser = req.user;

            const permissions = await this.permissionService.getUserPermissions(
                parseInt(userId),
                requestingUser
            );

            res.json({
                success: true,
                data: permissions
            });
        } catch (error) {
            next(error);
        }
    }

    async setUserPermissions(req, res, next) {
        try {
            const { userId } = req.params;
            const { permissions } = req.body;
            const requestingUser = req.user;

            const updatedPermissions = await this.permissionService.setUserPermissions(
                parseInt(userId),
                permissions,
                requestingUser
            );

            res.json({
                success: true,
                data: updatedPermissions,
                message: req.t('templates.updated', {
                    entity: req.t('entities.permission.plural') 
                })
            });
        } catch (error) {
            next(error);
        }
    }
}