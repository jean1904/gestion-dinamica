import express from 'express';
import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';
import { tenantMiddleware } from '#middlewares/tenant.middleware.js';
import { CurrencyRateRepository } from './currencyRate.repository.js';
import { CurrencyRateService } from './currencyRate.service.js';
import { CurrencyRateController } from './currencyRate.controller.js';
import { validateSaveTodayRates } from './currencyRate.validators.js';

const router = express.Router();

// Dependency Injection
const currencyRateRepository = new CurrencyRateRepository();
const currencyRateService = new CurrencyRateService(currencyRateRepository);
const currencyRateController = new CurrencyRateController(currencyRateService);

router.use(jwtAuthMiddleware);
router.use(tenantMiddleware);

router.get('/today', currencyRateController.getTodayRates.bind(currencyRateController));

router.post('/today', validateSaveTodayRates, currencyRateController.saveTodayRates.bind(currencyRateController));

router.post('/convert-currency', currencyRateController.convertCurrency.bind(currencyRateController));

export default router;