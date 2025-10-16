import { TenantResource } from './resources/tenantResource.js';

export class TenantController {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }

    async getAllTenants(req, res, next) {
        try {
            const { status } = req.query;

            const filters = {};
            if (status !== undefined) filters.status = parseInt(status);

            const tenants = await this.tenantService.getAllTenants(filters);
            const formattedTenants = TenantResource.collection(tenants);

            res.json({
                success: true,
                data: formattedTenants,
                total: tenants.length
            });
        } catch (error) {
            next(error);
        }
    }

    async getTenantById(req, res, next) {
        try {
            const { id } = req.params;

            const tenant = await this.tenantService.getTenantById(parseInt(id));
            const formattedTenant = TenantResource.transform(tenant);

            res.json({
                success: true,
                data: formattedTenant
            });
        } catch (error) {
            next(error);
        }
    }

    async createTenantWithManager(req, res, next) {
        try {
            const data = req.body;

            const newTenant = await this.tenantService.createTenantWithManager(data);
            const formattedTenant = TenantResource.transform(newTenant);

            res.status(201).json({
                success: true,
                data: formattedTenant,
                message: req.t('success.tenant.created')
            });
        } catch (error) {
            next(error);
        }
    }

    async updateTenant(req, res, next) {
        try {
            const { id } = req.params;
            const tenantData = req.body;

            const updatedTenant = await this.tenantService.updateTenant(
                parseInt(id),
                tenantData
            );

            const formattedTenant = TenantResource.transform(updatedTenant);

            res.json({
                success: true,
                data: formattedTenant,
                message: req.t('success.tenant.updated')
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteTenant(req, res, next) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

            await this.tenantService.deleteTenant(parseInt(id), requestingUser);

            res.json({
                success: true,
                message: req.t('success.tenant.deleted')
            });
        } catch (error) {
            next(error);
        }
    }
}