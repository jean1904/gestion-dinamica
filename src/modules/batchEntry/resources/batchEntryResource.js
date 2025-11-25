export class BatchEntryResource {
    static transform(batchEntry) {
        if (!batchEntry) return null;

        return {
            id: batchEntry.id,
            createdAt: batchEntry.created_at,
            createdBy: batchEntry.created_by_fullname ? {
                id: batchEntry.created_by,
                fullName: batchEntry.created_by_fullname,
                email: batchEntry.created_by_email
            } : null
        };
    }
    
    static transformDetail(batchEntry) {
        if (!batchEntry) return null;

        return {
            id: batchEntry.id,
            createdAt: batchEntry.created_at,
            createdBy: batchEntry.created_by_fullname ? {
                id: batchEntry.created_by,
                fullName: batchEntry.created_by_fullname,
                email: batchEntry.created_by_email
            } : null,
            items: batchEntry.items ? batchEntry.items.map(item => ({
                id: item.id,
                itemId: item.item_id,
                name: item.item_name,
                description: item.item_description,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unit_price),
                currency_code: item.currency_code,
                barcode: item.item_barcode,
                unitType: item.item_unit_type
            })) : [],
            costs: batchEntry.costs ? batchEntry.costs.map(cost => ({
                id: cost.id,
                name: cost.name,
                amount: parseFloat(cost.amount),
                currency_code: cost.currency_code
            })) : [],
            totalItems: batchEntry.items ? batchEntry.items.length : 0
        };
    }

    static collection(batchEntries) {
        return batchEntries.map(batchEntry => this.transform(batchEntry));
    }
}