import { db } from '#config/db.js';
import { AppError } from '#utils/errorHandler.util.js';

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
}