// prices/price.routes.js
import express from 'express';
import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';
import { tenantMiddleware } from '#middlewares/tenant.middleware.js';
import { PriceRepository } from './price.repository.js';
import { PriceQueryRepository } from './price-query.repository.js';
import { PriceService } from './price.service.js';
import { PriceCalculationService } from './price-calculation.service.js';
import { CurrencyRateRepository } from '#modules/currencyRate/currencyRate.repository.js';
import { CurrencyRateService } from '#modules/currencyRate/currencyRate.service.js';
import { PriceController } from './price.controller.js';
import { ValidateUpdatePrices } from './price.validators.js';

const router = express.Router();

// Dependency Injection
const priceRepository = new PriceRepository();
const priceQueryRepository = new PriceQueryRepository();
const priceCalculationService = new PriceCalculationService(priceQueryRepository);
const priceService = new PriceService(priceRepository, priceCalculationService);

const currencyRateRepository = new CurrencyRateRepository();
const currencyRateService = new CurrencyRateService(currencyRateRepository);

const priceController = new PriceController(
    priceService, 
    priceCalculationService,
    currencyRateService
);

router.use(jwtAuthMiddleware);
router.use(tenantMiddleware);

router.get('/calculate', priceController.calculatePrices.bind(priceController));
router.post('/update', ValidateUpdatePrices, priceController.updatePrices.bind(priceController));

export default router;