import { AppError } from '#utils/errorHandler.util.js';
import { t } from '#config/i18n.js';

export class PriceController {
    constructor(priceService, priceCalculationService, currencyRateService) {
        this.priceService = priceService;
        this.priceCalculationService = priceCalculationService;
        this.currencyRateService = currencyRateService;
    }

    async calculatePrices(req, res, next) {
        try {
            const { tenant_id } = req.user;

            const { page, limit, search } = req.query;
        
            const filters = {
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 50,
                ...(search && { search })
            };

            const ratesResult = await this.currencyRateService.getTodayRates(tenant_id);

            if (!ratesResult || ratesResult.length === 0) {
                throw new AppError(
                    'NOT_FOUND_ERROR',
                    t('errors.exchangeRate.no_rates_today')
                );
            }

            const rateUsd = ratesResult.find(rate => rate.code === 'USD');
            const rateCash = ratesResult.find(rate => rate.code === 'USD_CASH');

            if (!rateUsd || !rateCash) {
                throw new AppError(
                    'NOT_FOUND_ERROR',
                    t('errors.exchangeRate.missing_today_rates')
                );
            }

            const result = await this.priceCalculationService.calculatePrices(
                tenant_id,
                parseFloat(rateUsd.value),
                parseFloat(rateCash.value),
                rateUsd.currency_id,
                rateCash.currency_id,
                filters
            );

            return res.status(200).json({
                success: true,
                data: result
            });

        } catch (error) {
            next(error);
        }
    }

    async updatePrices(req, res, next) {
        try {
            const { modified_items } = req.body;
            const { tenant_id } = req.user;

            const ratesResult = await this.currencyRateService.getTodayRates(tenant_id);

            if (!ratesResult || ratesResult.length === 0) {
                throw new AppError(
                    'NOT_FOUND_ERROR',
                    t('errors.exchangeRate.no_rates_today')
                );
            }

            const rateUsd = ratesResult.find(rate => rate.code === 'USD');
            const rateCash = ratesResult.find(rate => rate.code === 'USD_CASH');

            if (!rateUsd || !rateCash) {
                throw new AppError(
                    'NOT_FOUND_ERROR',
                    t('errors.exchangeRate.missing_today_rates')
                );
            }

            const result = await this.priceService.updatePrices(
                tenant_id, 
                modified_items || [],
                parseFloat(rateUsd.value),
                parseFloat(rateCash.value),
                rateUsd.currency_id,
                rateCash.currency_id
            );

            return res.status(200).json({
                success: true,
                data: result,
                message: req.t('templates.updated', {
                    entity: req.t('entities.price.plural') 
                })
            });

        } catch (error) {
            next(error);
        }
    }
}