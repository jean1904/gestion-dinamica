import { db } from '#config/db.js';
import { AppError } from '#utils/errorHandler.util.js';
import { normalizePrice } from '#utils/normalizePrice.util.js';
import { CURRENCY_CODES } from '#constants/currencies.constant.js';

export class CurrencyRateService {
    constructor(currencyRateRepository) {
        this.currencyRateRepository = currencyRateRepository;
    }

    async getTodayRates(tenantId) {
        const rates = await this.currencyRateRepository.findTodayRates(tenantId);
        return rates || [];
    }

    async saveTodayRates(tenantId, ratesData) {
        if (!ratesData || ratesData.length === 0) {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.validation.rates_required'
            );
        }

        for (const rate of ratesData) {
            if (!rate.currencyId || !rate.value || parseFloat(rate.value) <= 0) {
                throw new AppError(
                    'VALIDATION_ERROR',
                    'errors.validation.invalid_rate_value'
                );
            }
        }

        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            for (const rate of ratesData) {
                await this.currencyRateRepository.upsertRate(
                    tenantId,
                    rate.currencyId,
                    rate.value,
                    connection
                );
            }

            await connection.commit();

            return await this.currencyRateRepository.findTodayRates(tenantId, connection);

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async convertCurrency(tenantId, amount, from) {
        if (!amount || parseFloat(amount) <= 0) {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.validation.invalid_amount'
            );
        }

        if (!from || !['VES', 'USD_BCV', 'USD_CASH'].includes(from)) {
            throw new AppError(
                'VALIDATION_ERROR',
                'errors.validation.invalid_currency_type'
            );
        }

        const rates = await this.getTodayRates(tenantId);

        if (!rates || rates.length === 0) {
            throw new AppError(
                'NOT_FOUND_ERROR',
                'errors.exchangeRate.no_rates_today'
            );
        }

        const rateUsd = rates.find(rate => rate.code === CURRENCY_CODES.USD);
        const rateCash = rates.find(rate => rate.code === CURRENCY_CODES.USD_CASH);

        if (!rateUsd || !rateCash) {
            throw new AppError(
                'NOT_FOUND_ERROR',
                'errors.exchangeRate.incomplete_rates'
            );
        }

        let currencyId;
        switch (from) {
            case 'VES':
                currencyId = 1;
                break;
            case 'USD_BCV':
                currencyId = 2;
                break;
            case 'USD_CASH':
                currencyId = 3;
                break;
        }

        const normalized = normalizePrice(parseFloat(amount), currencyId, {
            usdCurrencyId: 2,
            cashCurrencyId: 3,
            rateUsd: parseFloat(rateUsd.value),
            rateCash: parseFloat(rateCash.value)
        });

        return {
            ves: normalized.ves,
            usd_bcv: normalized.usd,
            usd_cash: normalized.cash
        };
    }
}