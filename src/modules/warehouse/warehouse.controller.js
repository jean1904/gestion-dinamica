import { WarehouseResource } from './resources/warehouseResource.js';

export class WarehouseController {
    constructor(warehouseService) {
        this.warehouseService = warehouseService;
    }

    async getAll(req, res, next) {
        try {
            const { tenant_id } = req.user;

            const warehouses = await this.warehouseService.getAll(tenant_id);
            const data = WarehouseResource.transformWithPermissions(warehouses);

            res.json({
                success: true,
                data: data
            });
        } catch (error) {
            next(error);
        }
    }
}