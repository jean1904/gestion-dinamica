import express from 'express';
import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';
import { tenantMiddleware } from '#middlewares/tenant.middleware.js';
import { WarehouseRepository } from './warehouse.repository.js';
import { WarehouseService } from './warehouse.service.js';
import { WarehouseController } from './warehouse.controller.js';


const router = express.Router();

// Dependency Injection
const warehouseRepository = new WarehouseRepository();
const warehouseService = new WarehouseService(warehouseRepository);
const warehouseController = new WarehouseController(warehouseService);

router.use(jwtAuthMiddleware);
router.use(tenantMiddleware);

router.get('/', warehouseController.getAll.bind(warehouseController));


export default router;