import express from 'express';
import { jwtAuthMiddleware } from '../../middlewares/jwtAuth.middleware.js';
import { tenantMiddleware, managerMiddleware } from '../../middlewares/tenant.middleware.js';
import { PermissionRepository } from './permission.repository.js';
import { UserRepository } from '../users/user.repository.js';
import { PermissionService } from './permission.service.js';
import { PermissionController } from './permission.controller.js';

const router = express.Router();

// Dependency Injection
const permissionRepository = new PermissionRepository();
const userRepository = new UserRepository();
const permissionService = new PermissionService(permissionRepository, userRepository);
const permissionController = new PermissionController(permissionService);

router.use(jwtAuthMiddleware);
router.use(tenantMiddleware);

router.get('/:userId', (req, res) => permissionController.getUserPermissions(req, res));

router.put('/:userId', managerMiddleware, (req, res) => permissionController.setUserPermissions(req, res));

export default router;