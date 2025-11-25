import { AppError } from '#utils/errorHandler.util.js';
import { t } from '#config/i18n.js';

export class WarehouseService {
    constructor(warehouseRepository) {
        this.warehouseRepository = warehouseRepository;
    }

    async getAll(tenant_id) {
        const canManageMultiple = await this.userHasMultipleWarehousesPermission(tenant_id);

        const warehouses = await this.warehouseRepository.findByTenant(tenant_id);

        if (!warehouses) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                t('templates.no_entities', { entityPlural: t('entities.warehouse.plural').toLowerCase() })
            );
        }

        if (!canManageMultiple) {
            const defaultWarehouse = warehouses.find(w => w.is_default);
            return {
                warehouses: defaultWarehouse ? [defaultWarehouse] : [],
                canSelectWarehouse: false,
                defaultWarehouseId: defaultWarehouse?.id
            };
        }

        const defaultWarehouse = warehouses.find(w => w.is_default);
        return {
            warehouses: warehouses,
            canSelectWarehouse: true,
            defaultWarehouseId: defaultWarehouse?.id
        };

    }


     async userHasMultipleWarehousesPermission(tenantId) {
        // TODO: Por ahora siempre retorna false (solo 1 warehouse)
        // return tenant.plan === 'premium' || tenant.plan === 'enterprise';
        
        return false;
    }

}