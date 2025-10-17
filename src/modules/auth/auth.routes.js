import express from 'express';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthRepository } from './auth.repository.js';
import { validateLogin } from './auth.validators.js';

const router = express.Router();

// Dependency Injection
const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

router.post('/login', validateLogin, authController.login.bind(authController));

export default router;
