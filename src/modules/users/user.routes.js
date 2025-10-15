import express from 'express';
import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';
import { tenantMiddleware, managerMiddleware } from '#middlewares/tenant.middleware.js';
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

router.get('/', managerMiddleware, userController.getAllUsers.bind(userController));

router.get('/:id', managerMiddleware, userController.getUserById.bind(userController));

router.post('/', managerMiddleware, validateCreateUser, userController.createUser.bind(userController));

router.put('/:id', managerMiddleware, validateUpdateUser, userController.updateUser.bind(userController));

router.delete('/:id', managerMiddleware, userController.deleteUser.bind(userController));

export default router;