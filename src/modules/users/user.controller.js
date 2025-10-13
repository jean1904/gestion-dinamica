import { UserResource } from './resources/userResource.js';

export class UserController {
    constructor(userService) {
        this.userService = userService;
    }

    async getAllUsers(req, res) {
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
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getUserById(req, res) {
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
            const statusCode = error.message === 'User not found' ? 404 : 403;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async createUser(req, res) {
        try {
            const userData = req.body;
            const requestingUser = req.user;

            const newUser = await this.userService.createUser(userData, requestingUser);
            const formattedUser = UserResource.transform(newUser);

            res.status(201).json({
                success: true,
                data: formattedUser,
                message: 'User created successfully'
            });
        } catch (error) {
            const statusCode = error.message.includes('already in use') ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateUser(req, res) {
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
                message: 'User updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

            await this.userService.deleteUser(parseInt(id), requestingUser);

            res.json({
                success: true,
                message: 'User deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
}