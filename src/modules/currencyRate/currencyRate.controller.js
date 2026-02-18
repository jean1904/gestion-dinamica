import { CurrencyRateResource } from './resources/currencyRate.resource.js';

export class CurrencyRateController {
    constructor(currencyRateService) {
        this.currencyRateService = currencyRateService;
    }

    async getTodayRates(req, res, next) {
        try {
            const { tenant_id } = req.user;

            const rates = await this.currencyRateService.getTodayRates(tenant_id);
            const formattedRates = CurrencyRateResource.collection(rates);

            res.json({
                success: true,
                data: formattedRates
            });
        } catch (error) {
            next(error);
        }
    }

    async saveTodayRates(req, res, next) {
        try {
            const { tenant_id } = req.user;
            const { rates } = req.body;

            const updatedRates = await this.currencyRateService.saveTodayRates(
                tenant_id,
                rates
            );
            const formattedRates = CurrencyRateResource.collection(updatedRates);

            res.json({
                success: true,
                data: formattedRates,
                message: req.t('templates.updated', {
                    entity: req.t('entities.exchangeRate.singular') 
                })
            });
        } catch (error) {
            next(error);
        }
    }

    async convertCurrency(req, res, next) {
        try {
            const { tenant_id } = req.user;
            const { amount, from } = req.body;

            const converted = await this.currencyRateService.convertCurrency(
                tenant_id,
                amount,
                from
            );

            res.json({
                success: true,
                data: converted
            });
        } catch (error) {
            next(error);
        }
    }
}