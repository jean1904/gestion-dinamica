// modules/inventory/inventory.service.js
export class InventoryService {
    constructor(inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    async addStock(warehouseId, itemId, quantity, connection = null) {
        if (quantity <= 0) {
            throw new AppError('VALIDATION_ERROR', 'errors.validation.invalid_quantity');
        }

        const existing = await this.inventoryRepository.findByWarehouseAndItem(
            warehouseId, 
            itemId, 
            connection
        );

        if (existing) {
            const currentQuantity = parseFloat(existing.quantity);
            const newQuantity = currentQuantity + quantity;
            await this.inventoryRepository.updateQuantity(
                warehouseId, 
                itemId, 
                newQuantity, 
                connection
            );
            
            return {
                id: existing.id,
                warehouseId,
                itemId,
                quantity: newQuantity,
                previousQuantity: existing.quantity,
                quantityAdded: quantity
            };
        } else {
            const created = await this.inventoryRepository.create({
                warehouseId,
                itemId,
                quantity
            }, connection);
            
            return {
                ...created,
                previousQuantity: 0,
                quantityAdded: quantity
            };
        }
    }

    async reduceStock(warehouseId, itemId, quantity, connection = null) {
        const existing = await this.inventoryRepository.findByWarehouseAndItem(
            warehouseId, 
            itemId, 
            connection
        );

        if (!existing) {
            throw new AppError('NOT_FOUND_ERROR', t('templates.not_found', { 
                entity: t('entities.inventory.singular') 
            }));
        }

        const currentQuantity = parseFloat(existing.quantity);
    
        if (currentQuantity < quantity) {
            throw new AppError('VALIDATION_ERROR', 'errors.validation.insufficient_stock');
        }

        const newQuantity = currentQuantity - quantity;
        await this.inventoryRepository.updateQuantity(
            warehouseId, 
            itemId, 
            newQuantity, 
            connection
        );
        
        return {
            id: existing.id,
            warehouseId,
            itemId,
            quantity: newQuantity,
            previousQuantity: existing.quantity,
            quantityReduced: quantity
        };
    }

    async getCurrentStock(warehouseId, itemId) {
        const inventory = await this.inventoryRepository.findByWarehouseAndItem(warehouseId, itemId);
        return inventory ? inventory.quantity : 0;
    }
}