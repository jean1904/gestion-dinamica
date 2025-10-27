export class CurrencyRateResource {
    static transform(rate) {
        return {
            currencyId: rate.currency_id,
            code: rate.code,
            name: rate.name,
            symbol: rate.symbol,
            value: parseFloat(rate.value)
        };
    }

    static collection(rates) {
        return rates.map(rate => this.transform(rate));
    }
}