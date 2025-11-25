import express from 'express';
import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';
import { tenantMiddleware } from '#middlewares/tenant.middleware.js';
import { BatchEntryRepository } from './batchEntry.repository.js';
import { BatchEntryService } from './batchEntry.service.js';
import { BatchEntryController } from './batchEntry.controller.js';
import { InventoryRepository } from '#modules/inventory/inventory.repository.js';
import { InventoryService } from '#modules/inventory/inventory.service.js';
import { CurrencyRateRepository } from '#modules/currencyRate/currencyRate.repository.js';
import { CurrencyRateService } from '#modules/currencyRate/currencyRate.service.js';
import { validateCreateBatchEntry } from './batchEntry.validators.js';


const router = express.Router();

// Dependency Injection
const batchEntryRepository = new BatchEntryRepository();
const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);
const currencyRateRepository = new CurrencyRateRepository();
const currencyRateService = new CurrencyRateService(currencyRateRepository);
const batchEntryService = new BatchEntryService(batchEntryRepository, inventoryService, currencyRateService);
const batchEntryController = new BatchEntryController(batchEntryService);

router.use(jwtAuthMiddleware);
router.use(tenantMiddleware);

router.get('/', batchEntryController.getAllBatchEntries.bind(batchEntryController));

router.get('/:id', batchEntryController.getDetail.bind(batchEntryController));

router.post('/', validateCreateBatchEntry, batchEntryController.create.bind(batchEntryController));

export default router;