import bcrypt from 'bcrypt';
import { db } from '../../config/db.js';

export class TenantService {
    constructor(tenantRepository, userRepository) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
    }

    async getAllTenants(filters = {}) {
        try {
            const tenants = await this.tenantRepository.findAll(filters);
            return tenants;
        } catch (error) {
            throw new Error('Failed to fetch tenants');
        }
    }

    async getTenantById(tenantId) {
        try {
            const tenant = await this.tenantRepository.findById(tenantId);
            
            if (!tenant) {
                throw new Error('Tenant not found');
            }

            return tenant;
        } catch (error) {
             throw error;
        }
    }

    async createTenantWithManager(data) {
        if (!data.name) {
            throw new Error('Tenant name is required');
        }

        if (!data.email || !data.firstName || !data.lastName) {
            throw new Error('Manager email, firstName and lastName are required');
        }

        const emailExists = await this.userRepository.emailExists(data.email);
        
        if (emailExists) {
            throw new Error('Email already in use');
        }

        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const tenant = await this.tenantRepository.create({
                name: data.name,
                status: data.status !== undefined ? data.status : 1
            }, connection);

            const hashedPassword = await bcrypt.hash(data.password || "123456", 10);

            const manager = await this.userRepository.create({
                tenantId: tenant.id,
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: 'manager',
                status: data.status !== undefined ? data.status : 1
            }, connection);

            await connection.commit();
            
            return { tenant, manager };
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async updateTenant(tenantId, tenantData) {
        try {
            const updatedTenant = await this.tenantRepository.update(tenantId, tenantData);
            return updatedTenant;
        } catch (error) {
             throw error;
        }
    }

    async deleteTenant(tenantId) {
        try {
            await this.getTenantById(tenantId);

            await this.tenantRepository.softDelete(tenantId);
            return { message: 'Tenant deleted successfully' };
        } catch (error) {
             throw error;
        }
    }
}