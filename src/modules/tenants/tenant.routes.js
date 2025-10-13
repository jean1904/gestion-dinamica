import express from 'express';
import { jwtAuthMiddleware } from '../../middlewares/jwtAuth.middleware.js';
import { adminMiddleware } from '../../middlewares/admin.middleware.js';
import { TenantRepository } from './tenant.repository.js';
import { TenantService } from './tenant.service.js';
import { TenantController } from './tenant.controller.js';
import { validateCreateTenant, validateUpdateTenant } from './tenant.validators.js';
import { UserRepository } from '../users/user.repository.js'; 

const router = express.Router();

// Dependency Injection
const tenantRepository = new TenantRepository();
const userRepository = new UserRepository(); 

const tenantService = new TenantService(tenantRepository, userRepository);
const tenantController = new TenantController(tenantService);

router.use(jwtAuthMiddleware);
router.use(adminMiddleware);

router.get('/', (req, res) => tenantController.getAllTenants(req, res));

router.get('/:id', (req, res) => tenantController.getTenantById(req, res));

router.post('/', validateCreateTenant, (req, res) => tenantController.createTenantWithManager(req, res));

router.put('/:id', validateUpdateTenant, (req, res) => tenantController.updateTenant(req, res));

router.delete('/:id', (req, res) => tenantController.deleteUser(req, res));

export default router;