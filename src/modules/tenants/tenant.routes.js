import express from 'express';
import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';
import { adminMiddleware } from '#middlewares/admin.middleware.js';
import { TenantRepository } from './tenant.repository.js';
import { TenantService } from './tenant.service.js';
import { TenantController } from './tenant.controller.js';
import { validateCreateTenant, validateUpdateTenant } from './tenant.validators.js';
import { UserRepository } from '#modules/users/user.repository.js'; 

const router = express.Router();

// Dependency Injection
const tenantRepository = new TenantRepository();
const userRepository = new UserRepository(); 

const tenantService = new TenantService(tenantRepository, userRepository);
const tenantController = new TenantController(tenantService);

router.use(jwtAuthMiddleware);
router.use(adminMiddleware);


router.get('/', tenantController.getAllTenants.bind(tenantController));

router.get('/:id', tenantController.getTenantById.bind(tenantController));

router.post('/', validateCreateTenant, tenantController.createTenantWithManager.bind(tenantController));

router.put('/:id', validateUpdateTenant, tenantController.updateTenant.bind(tenantController));

router.delete('/:id', tenantController.deleteTenant.bind(tenantController));

/*
// Example of routes with permission checks
import { checkPermission, checkAnyPermission } from '#middlewares/permission.middleware.js';
router.get(
    '/',
    checkAnyPermission([
        { module: 'sales', action: 'read' },
        { module: 'inventory', action: 'read' }
    ]),
    tenantController.getAllSales.bind(tenantController)
);

// Route to create a sale, requiring 'create' permission in 'sales' module
router.post(
    '/',
    checkPermission('sales', 'create'),
    tenantController.createSale.bind(tenantController)
);
*/

export default router;