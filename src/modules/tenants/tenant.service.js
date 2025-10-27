import bcrypt from 'bcrypt';
import { db } from '#config/db.js';
import { AppError } from '#utils/errorHandler.util.js';
import { t } from '#config/i18n.js';

export class TenantService {
    constructor(tenantRepository, userRepository) {
        this.tenantRepository = tenantRepository;
        this.userRepository = userRepository;
    }

    async getAllTenants(filters = {}) {
        const tenants = await this.tenantRepository.findAll(filters);

        if (!tenants) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                t('templates.no_entities', { entityPlural: t('entities.tenant.plural').toLowerCase() })
            );
        }
        return tenants;
    }

    async getTenantById(tenantId) {
        const tenant = await this.tenantRepository.findById(tenantId);
        
        if (!tenant) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                t('templates.not_found', { entity: t('entities.tenant.singular') })
            );
        }
        return tenant;
    }

    async createTenantWithManager(data) {

        const emailExists = await this.userRepository.emailExists(data.email);
        
        if (emailExists) {
            throw new AppError(
                'CONFLICT_ERROR',
                'errors.conflict.email_exists'
            );
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
        if (tenantId === 1) {
            throw new AppError(
                'FORBIDDEN_ERROR', 
                'errors.forbidden.system_tenant_modify'
            );
        }

        const updatedTenant = await this.tenantRepository.update(tenantId, tenantData);
        return updatedTenant;
    }

    async deleteTenant(tenantId) {
        if (tenantId === 1) {
            throw new AppError(
                'FORBIDDEN_ERROR', 
                'errors.forbidden.system_tenant_delete'
            );
        }

        await this.getTenantById(tenantId);

        await this.tenantRepository.softDelete(tenantId);
        return { deleted: true };
    }
}