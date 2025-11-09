import { AppError } from '#utils/errorHandler.util.js';

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
        let priceUsd, priceVes, priceCash;

        // Caso 1: El precio base está en USD
        if (item.base_currency_id === usdCurrencyId) {
            priceUsd = parseFloat(item.price_usd);
            priceVes = priceUsd * rateUsd;
            priceCash = priceVes / rateCash;
        }
        // Caso 2: El precio base está en USD_CASH
        else if (item.base_currency_id === cashCurrencyId) {
            priceCash = parseFloat(item.price_cash);
            priceVes = priceCash * rateCash;
            priceUsd = priceVes / rateUsd;
        }
        // Caso por defecto: si tiene base_currency_id pero no es válido
        else {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.validation.invalid_currency'
            );
        }

        return {
            id: item.price_id,
            item_id: item.item_id,
            item_name: item.item_name,
            item_barcode: item.barcode,
            base_currency_id: item.base_currency_id,
            price_usd: this._roundPrice(priceUsd),
            price_ves: this._roundPrice(priceVes),
            price_cash: this._roundPrice(priceCash)
        };
    }

    _roundPrice(price) {
        return Math.round(price * 100) / 100;
    }
}