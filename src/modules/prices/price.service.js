import { db } from '#config/db.js';

export class PriceService {
    constructor(priceRepository, priceCalculationService) {
        this.priceRepository = priceRepository;
        this.priceCalculationService = priceCalculationService;
    }

    async updatePrices(tenantId, modifiedItems, rateUsd, rateCash, usdCurrencyId, cashCurrencyId) {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            let customUpdated = 0;
            let recalculated = 0;

            // note: here validate the items that have personalized prices
            if (Array.isArray(modifiedItems) && modifiedItems.length > 0) {

                const result = await this.priceRepository.bulkUpdate(tenantId, modifiedItems, connection);
                customUpdated = result.affectedRows;

                const modifiedIds = modifiedItems.map(item => item.id);

                const calculatedItems = await this.priceCalculationService.calculateAllPrices(
                    tenantId,
                    rateUsd,
                    rateCash,
                    usdCurrencyId,
                    cashCurrencyId,
                    modifiedIds 
                );

                if (Array.isArray(calculatedItems) && calculatedItems.length > 0) {
                    const calcResult = await this.priceRepository.bulkUpdate(tenantId, calculatedItems, connection);
                    recalculated = calcResult.affectedRows;
                }
            }

            else {

                const calculatedItems = await this.priceCalculationService.calculateAllPrices(
                    tenantId,
                    rateUsd,
                    rateCash,
                    usdCurrencyId,
                    cashCurrencyId,
                    null
                );

                if (Array.isArray(calculatedItems) && calculatedItems.length > 0) {
                    const calcResult = await this.priceRepository.bulkUpdate(tenantId, calculatedItems, connection);
                    recalculated = calcResult.affectedRows;
                }
            }

            await connection.commit();

            return {
                custom_updated: customUpdated,
                recalculated,
                total_updated: customUpdated + recalculated
            };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}