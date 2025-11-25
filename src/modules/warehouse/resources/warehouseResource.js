export class WarehouseResource {
    static transform(warehouse) {
        if (!warehouse) return null;

        return {
            id: warehouse.id,
            code: warehouse.code,
            name: warehouse.name,
            isDefault: Boolean(warehouse.is_default),
            status: warehouse.status,
            createdAt: warehouse.created_at,
            updatedAt: warehouse.updated_at
        };
    }

    static collection(warehouses) {
        return warehouses.map(warehouse => this.transform(warehouse));
    }

    static transformWithPermissions(data) {
        return {
            warehouses: this.collection(data.warehouses),
            canSelectWarehouse: data.canSelectWarehouse,
            defaultWarehouseId: data.defaultWarehouseId
        };
    }
}