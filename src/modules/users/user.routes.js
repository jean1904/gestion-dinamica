import express from 'express';
import { jwtAuthMiddleware } from '../../middlewares/jwtAuth.middleware.js';
import { tenantMiddleware, managerMiddleware } from '../../middlewares/tenant.middleware.js';
import { UserRepository } from './user.repository.js';
import { UserService } from './user.service.js';
import { UserController } from './user.controller.js';
import { validateCreateUser, validateUpdateUser } from './user.validators.js';

const router = express.Router();

// Dependency Injection
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.use(jwtAuthMiddleware);
router.use(tenantMiddleware);

router.get('/', managerMiddleware, (req, res) => userController.getAllUsers(req, res));

router.get('/:id', managerMiddleware, (req, res) => userController.getUserById(req, res));

router.post('/', managerMiddleware, validateCreateUser, (req, res) => userController.createUser(req, res));

router.put('/:id', managerMiddleware, validateUpdateUser, (req, res) => userController.updateUser(req, res));

router.delete('/:id', managerMiddleware, (req, res) => userController.deleteUser(req, res));

export default router;