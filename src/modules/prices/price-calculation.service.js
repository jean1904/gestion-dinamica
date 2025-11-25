import { AppError } from '#utils/errorHandler.util.js';
import { normalizePrice } from '#utils/normalizePrice.util.js';

export class PriceCalculationService {
    constructor(priceQueryRepository) {
        this.priceQueryRepository = priceQueryRepository;
    }

    async calculatePrices(tenantId, rateUsd, rateCash, usdCurrencyId, cashCurrencyId, filters = {}) {
        const result = await this.priceQueryRepository.findItemsWithPricesForCalculation(
            tenantId, 
            filters
        );

        const { items, total, page, totalPages } = result;

        if (!items || items.length === 0) {
            return {
                items: [],
                total_items: 0,
                page: filters.page || 1,
                total_pages: 0
            };
        }

        const calculatedItems = items
            .filter(item => item.price_id !== null)
            .map(item => {
                return this._calculateItemPrices(
                    item, 
                    rateUsd, 
                    rateCash, 
                    usdCurrencyId, 
                    cashCurrencyId
                );
            });

        return {
            items: calculatedItems,
            total_items: total,
            page: page,
            total_pages: totalPages
        };
    }

    async calculateAllPrices(tenantId, rateUsd, rateCash, usdCurrencyId, cashCurrencyId, excludeItemIds = null) {
        const filters = {};
        
        if (excludeItemIds && excludeItemIds.length > 0) {
            filters.exclude_item_ids = excludeItemIds;
        }
        
        const items = await this.priceQueryRepository.findAllItemsWithPricesForCalculation(
            tenantId, 
            filters
        );

        if (!items || items.length === 0) {
            return [];
        }

        const calculatedItems = items.map(item => {
            return this._calculateItemPrices(
                item, 
                rateUsd, 
                rateCash, 
                usdCurrencyId, 
                cashCurrencyId
            );
        });

        return calculatedItems; 
    }

    _calculateItemPrices(item, rateUsd, rateCash, usdCurrencyId, cashCurrencyId) {
        // 1. Determinar cuál monto usar según la moneda base
        let baseAmount;

        if (item.base_currency_id === usdCurrencyId) {
            baseAmount = item.price_usd;
        } 
        else if (item.base_currency_id === cashCurrencyId) {
            baseAmount = item.price_cash;
        } 
        else {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.validation.invalid_currency'
            );
        }

        // 2. Normalizar usando el helper global
        const prices = normalizePrice(baseAmount, item.base_currency_id, {
            usdCurrencyId,
            cashCurrencyId,
            rateUsd,
            rateCash
        });

        // 3. Devolver exactamente la misma estructura que antes
        return {
            id: item.price_id,
            item_id: item.item_id,
            item_name: item.item_name,
            item_barcode: item.barcode,
            base_currency_id: item.base_currency_id,

            price_usd: prices.usd,
            price_ves: prices.ves,
            price_cash: prices.cash
        };
    }

    _roundPrice(price) {
        return Math.round(price * 100) / 100;
    }
}