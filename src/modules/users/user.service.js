import bcrypt from 'bcrypt';
import { AppError } from '#utils/errorHandler.util.js';

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getAllUsers(tenantId, filters = {}) {
        const users = await this.userRepository.findByTenant(tenantId, filters);

        if (!users) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                'errors.not_found.users'
            );
        }
        return users;
    }

    async getUserById(userId, requestingUserTenantId) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                'errors.not_found.user'
            );
        }

        if (user.tenant_id !== requestingUserTenantId) {
            throw new AppError(
                'AUTHENTICATION_ERROR', 
                'errors.not_found.user'
            );
        }
        return user;
    }

    async createUser(userData, requestingUser) {
        if (requestingUser.role !== 'manager') {
            throw new AppError(
                'AUTHENTICATION_ERROR', 
                'errors.authentication.only_managers'
            );
        }

        const emailExists = await this.userRepository.emailExists(
            userData.email,
        );
        
        if (emailExists) {
            throw new AppError(
                'CONFLICT_ERROR', 
                'errors.conflict.email_exists'
            );
        }

        const hashedPassword = await bcrypt.hash('123456', 10);

        const newUser = await this.userRepository.create({
            tenantId: requestingUser.tenant_id,
            email: userData.email,
            password: hashedPassword,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: 'user',
            status: userData.status !== undefined ? userData.status : 1
        });

        delete newUser.password;

        return newUser;
    }

    async updateUser(userId, userData, requestingUser) {
        const existingUser = await this.getUserById(userId, requestingUser.tenant_id);
        
        if (requestingUser.role !== 'manager') {
            throw new AppError(
                'AUTHENTICATION_ERROR', 
                'errors.authentication.only_managers'
            );
        }

        if (userData.email && userData.email !== existingUser.email) {
            const emailExists = await this.userRepository.emailExists(userData.email, userId);
            
            if (emailExists) {
                throw new AppError(
                    'CONFLICT_ERROR', 
                    'errors.conflict.email_exists'
                );
            }
        }

        const updatedUser = await this.userRepository.update(userId, userData);
        return updatedUser;
    }

    async deleteUser(userId, requestingUser) {
        await this.getUserById(userId, requestingUser.tenant_id);

        if (requestingUser.role !== 'manager') {
            throw new AppError(
                'AUTHENTICATION_ERROR', 
                'errors.authentication.only_managers'
            );
        }

        if (requestingUser.id === userId) {
            throw new AppError(
                'VALIDATION_ERROR', 
                'errors.authentication.cannot_delete_self'
            );
        }

        await this.userRepository.softDelete(userId);
        return { deleted: true };
    }
}