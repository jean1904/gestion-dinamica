import { AppError } from '#utils/errorHandler.util.js';

export function normalizePrice(amount, currencyId, {
    usdCurrencyId,
    cashCurrencyId,
    rateUsd,
    rateCash
}) {
    if (amount == null || isNaN(amount)) {
        throw new AppError('VALIDATION_ERROR', 'errors.validation.invalid_amount');
    }

    const value = parseFloat(amount);

    let usd, ves, cash;

    // Caso: entrada en USD
    if (currencyId === usdCurrencyId) {
        usd = value;
        ves = usd * rateUsd;         // USD → VES
        cash = ves / rateCash;       // VES → CASH
    }

    // Caso: entrada en USD cash
    else if (currencyId === cashCurrencyId) {
        cash = value;
        ves = cash * rateCash;       // CASH → VES
        usd = ves / rateUsd;         // VES → USD
    }

    // Caso: entrada en VES
    else {
        ves = value;
        usd = ves / rateUsd;         // VES → USD
        cash = ves / rateCash;       // VES → CASH
    }

    return {
        usd: round(usd),
        ves: round(ves),
        cash: round(cash)
    };
}

function round(num) {
    return Math.round(num * 100) / 100;
}
