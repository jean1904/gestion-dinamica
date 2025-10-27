import { UserResource } from './resources/userResource.js';

export class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async getAllUsers(req, res, next) {
        try {
            const { tenant_id } = req.user;
            const { role, status } = req.query;

            const filters = {};
            if (role) filters.role = role;
            if (status !== undefined) filters.status = parseInt(status);

            const users = await this.userService.getAllUsers(tenant_id, filters);
            const formattedUsers = UserResource.collection(users);

            res.json({
                success: true,
                data: formattedUsers,
                total: users.length
            });
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const { id } = req.params;
            const { tenant_id } = req.user;

            const user = await this.userService.getUserById(parseInt(id), tenant_id);
            const formattedUser = UserResource.transform(user);

            res.json({
                success: true,
                data: formattedUser
            });
        } catch (error) {
            next(error);
        }
    }

    async createUser(req, res, next) {
        try {
            const userData = req.body;
            const requestingUser = req.user;

            const newUser = await this.userService.createUser(userData, requestingUser);
            const formattedUser = UserResource.transform(newUser);

            res.status(201).json({
                success: true,
                data: formattedUser,
                message: req.t('templates.created', {
                    entity: req.t('entities.user.singular') 
                })
            });
        } catch (error) {
            next(error);
        }
    }

    async updateUser(req, res, next) {
        try {
            const { id } = req.params;
            const userData = req.body;
            const requestingUser = req.user;

            const updatedUser = await this.userService.updateUser(
                parseInt(id),
                userData,
                requestingUser
            );

            const formattedUser = UserResource.transform(updatedUser);

            res.json({
                success: true,
                data: formattedUser,
                message: req.t('templates.updated', {
                    entity: req.t('entities.user.singular') 
                })
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteUser(req, res, next) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

           await this.userService.deleteUser(parseInt(id), requestingUser);

            res.json({
                success: true,
                message: req.t('templates.deleted', {
                    entity: req.t('entities.user.singular') 
                })
            });
        } catch (error) {
            next(error);
        }
    }
}