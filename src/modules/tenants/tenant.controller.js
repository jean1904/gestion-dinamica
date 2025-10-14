import { TenantResource } from './resources/tenantResource.js';

export class TenantController {
    constructor(tenantService) {
        this.tenantService = tenantService;
    }

    async getAllTenants(req, res) {
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
            res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    async getTenantById(req, res) {
        try {
            const { id } = req.params;

            const tenant = await this.tenantService.getTenantById(parseInt(id));
            const formattedTenant = TenantResource.transform(tenant);

            res.json({
                success: true,
                data: formattedTenant
            });
        } catch (error) {
            const statusCode = error.message === 'Tenants not found' ? 404 : 403;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async createTenantWithManager(req, res) {
        try {
            const data = req.body;

            await this.tenantService.createTenantWithManager(data);

            res.status(201).json({
                success: true,
                message: 'Tenant created successfully'
            });
        } catch (error) {
            const statusCode = error.message.includes('already in use') ? 409 : 400;
            res.status(statusCode).json({
                success: false,
                message: error.message
            });
        }
    }

    async updateTenant(req, res) {
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
                message: 'Tenant updated successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }

    async deleteTenant(req, res) {
        try {
            const { id } = req.params;
            const requestingUser = req.user;

            await this.tenantService.deleteTenant(parseInt(id), requestingUser);

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