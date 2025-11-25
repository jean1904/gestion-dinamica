import { AppError } from '#utils/errorHandler.util.js';
import { t } from '#config/i18n.js';
import { db } from '#config/db.js';
import { normalizePrice } from '#utils/normalizePrice.util.js';
import { CURRENCY_CODES } from '#constants/currencies.constant.js';

export class BatchEntryService {
    constructor(batchEntryRepository, inventoryService, currencyRateService) {
        this.batchEntryRepository = batchEntryRepository;
        this.inventoryService = inventoryService;
        this.currencyRateService = currencyRateService;
    }

    async getAllBatchEntries(tenant_id, filters = {}) {
        const batchEntries = await this.batchEntryRepository.findByTenant(tenant_id, filters);

        if (!batchEntries) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                t('templates.no_entities', { entityPlural: t('entities.batchEntry.plural').toLowerCase() })
            );
        }
        return batchEntries;
    }

    async getBatchEntryDetail(tenant_id, id) {
        const batchEntry = await this.batchEntryRepository.findByIdComplete(tenant_id, id);

        if (!batchEntry) {
            throw new AppError(
                'NOT_FOUND_ERROR', 
                t('templates.no_entities', { entityPlural: t('entities.batchEntry.singular').toLowerCase() })
            );
        }

        return batchEntry;
    }

    async create(data, userId) {
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Obtener las tasas del día
            const ratesResult = await this.currencyRateService.getTodayRates(data.tenantId);
            
            if (!ratesResult || ratesResult.length === 0) {
                throw new AppError(
                    'NOT_FOUND_ERROR',
                    'errors.exchangeRate.no_rates_today'
                );
            }

            const rateUsd = ratesResult.find(rate => rate.code === CURRENCY_CODES.USD);
            const rateCash = ratesResult.find(rate => rate.code === CURRENCY_CODES.USD_CASH);
            
            const usdCurrencyId = rateUsd.currency_id;
            const cashCurrencyId = rateCash.currency_id;

            // 2. Crear el batch_entry principal
            const batchEntry = await this.batchEntryRepository.create({
                tenantId: data.tenantId,
                warehouseId: data.warehouseId,
                createdBy: userId
            }, connection);

            const inventoryResults = [];

            // 3. Procesar cada item
            for (const item of data.items) {
                let finalUnitPrice = item.unitPrice;
                let finalCurrencyId = item.currencyId;

                // Si no es USD ni CASH, es VES - convertir a USD
                if (item.currencyId !== usdCurrencyId && item.currencyId !== cashCurrencyId) {
                    const prices = normalizePrice(item.unitPrice, item.currencyId, {
                        usdCurrencyId,
                        cashCurrencyId,
                        rateUsd: rateUsd.value,
                        rateCash: rateCash.value
                    });
                    
                    finalUnitPrice = prices.usd;
                    finalCurrencyId = usdCurrencyId;
                }

                // Crear el detalle con el precio (posiblemente convertido)
                await this.batchEntryRepository.createItem({
                    batchEntryId: batchEntry.id,
                    itemId: item.itemId,
                    quantity: item.quantity,
                    unitPrice: finalUnitPrice,
                    currencyId: finalCurrencyId
                }, connection);

                const inventoryResult = await this.inventoryService.addStock(
                    data.warehouseId,
                    item.itemId,
                    item.quantity,
                    connection
                );

                inventoryResults.push({
                    itemId: item.itemId,
                    previousStock: inventoryResult.previousQuantity,
                    newStock: inventoryResult.quantity,
                    quantityAdded: inventoryResult.quantityAdded
                });
            }

            // 4. Procesar costos operacionales
            if (data.operationalCosts && data.operationalCosts.length > 0) {
                for (const cost of data.operationalCosts) {
                    let finalAmount = cost.amount;
                    let finalCurrencyId = cost.currencyId;
                    

                    // Si no es USD ni CASH, es VES - convertir a USD
                    if (cost.currencyId !== usdCurrencyId && cost.currencyId !== cashCurrencyId) {
                        const prices = normalizePrice(cost.amount, cost.currencyId, {
                            usdCurrencyId,
                            cashCurrencyId,
                            rateUsd: rateUsd.value,
                            rateCash: rateCash.value
                        });

                        finalAmount = prices.usd;
                        finalCurrencyId = usdCurrencyId;
                    }

                    await this.batchEntryRepository.createCost({
                        batchEntryId: batchEntry.id,
                        currencyId: finalCurrencyId,
                        name: cost.name,
                        amount: finalAmount
                    }, connection);
                }
            }

            await connection.commit();

            const createdBatchEntry = await this.batchEntryRepository.findByIdComplete(
                data.tenantId,
                batchEntry.id
            );

            return createdBatchEntry;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}