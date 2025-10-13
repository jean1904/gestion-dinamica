export class PermissionController {
	constructor(permissionService) {
		this.permissionService = permissionService;
	}

    async getUserPermissions(req, res) {
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
			const statusCode = error.message === 'User not found' ? 404 : 403;
			res.status(statusCode).json({
				success: false,
				message: error.message
			});
        }
  }

	async setUserPermissions(req, res) {
		try {
			const { userId } = req.params;
			const { permissions } = req.body;
			const requestingUser = req.user;

			if (!Array.isArray(permissions)) {
				return res.status(400).json({
				success: false,
				message: 'permissions must be an array'
				});
			}

			const updatedPermissions = await this.permissionService.setUserPermissions(
				parseInt(userId),
				permissions,
				requestingUser
			);

			res.json({
				success: true,
				data: updatedPermissions,
				message: 'Permissions updated successfully'
			});
		} catch (error) {
			res.status(400).json({
				success: false,
				message: error.message
			});
		}
	}
}