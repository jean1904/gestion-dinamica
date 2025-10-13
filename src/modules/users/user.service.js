import bcrypt from 'bcrypt';

export class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async getAllUsers(tenantId, filters = {}) {
        try {
            const users = await this.userRepository.findByTenant(tenantId, filters);
            return users;
        } catch (error) {
         
            throw new Error('Failed to fetch users');
        }
    }

    async getUserById(userId, requestingUserTenantId) {
        try {
            const user = await this.userRepository.findById(userId);
            
            if (!user) {
                throw new Error('User not found');
            }

            if (user.tenant_id !== requestingUserTenantId) {
                throw new Error('Access denied');
            }

            return user;
        } catch (error) {
            throw error;
        }
    }

    async createUser(userData, requestingUser) {
        try {
            if (requestingUser.role !== 'manager') {
                throw new Error('Only managers can create users');
            }

            if (!userData.email || !userData.password) {
                throw new Error('Email and password are required');
            }

            if (!userData.firstName || !userData.lastName) {
                throw new Error('First name and last name are required');
            }

            const emailExists = await this.userRepository.existsByEmail(
                userData.email, 
                requestingUser.tenant_id
            );
            
            if (emailExists) {
                throw new Error('Email already in use in this tenant');
            }

            if (userData.role && userData.role !== 'user') {
                throw new Error('Can only create users with role "user"');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const newUser = await this.userRepository.create({
                tenantId: requestingUser.tenant_id,
                email: userData.email,
                password: hashedPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                role: 'user',
                status: userData.status !== undefined ? userData.status : 1
            });

            return newUser;
        } catch (error) {
         
            throw error;
        }
    }

    async updateUser(userId, userData, requestingUser) {
        try {
            const existingUser = await this.getUserById(userId, requestingUser.tenant_id);

            if (requestingUser.role !== 'manager') {
                throw new Error('Only managers can update users');
            }

            if (userData.role) {
                throw new Error('Cannot change user role');
            }

            if (userData.email && userData.email !== existingUser.email) {
                const emailExists = await this.userRepository.existsByEmail(
                    userData.email, 
                    requestingUser.tenant_id, 
                    userId
                );
                
                if (emailExists) {
                    throw new Error('Email already in use');
                }
            }

            if (userData.password) {
                userData.password = await bcrypt.hash(userData.password, 10);
            }

            const updatedUser = await this.userRepository.update(userId, userData);
            return updatedUser;
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(userId, requestingUser) {
        try {
            await this.getUserById(userId, requestingUser.tenant_id);

            if (requestingUser.role !== 'manager') {
                throw new Error('Only managers can delete users');
            }

            if (requestingUser.id === userId) {
                throw new Error('Cannot delete yourself');
            }

            await this.userRepository.softDelete(userId);
            return { message: 'User deleted successfully' };
        } catch (error) {
            throw error;
        }
    }
}