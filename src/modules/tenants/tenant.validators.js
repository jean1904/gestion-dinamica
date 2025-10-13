import { body, validationResult } from 'express-validator';

export const validateCreateTenant = [
    body('name')
        .notEmpty().withMessage('Nombre del tenant requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre del tenant debe tener al menos 2 caracteres'),
    body('email')
        .notEmpty().withMessage('Email requerido')
        .isEmail().withMessage('Email inválido')
        .normalizeEmail(),
    body('firstName')
        .notEmpty().withMessage('El nombre del manager es requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre del manager debe tener al menos 2 caracteres'),
    body('lastName')
        .notEmpty().withMessage('El apellido del manager es requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El apellido del manager debe tener al menos 2 caracteres'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMap = {};
            errors.array().forEach(err => {
                if (!errorMap[err.path]) {
                    errorMap[err.path] = err.msg;
                }
            });
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errorMap
            });
        }
        next();
    }
];

export const validateUpdateTenant = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre del tenant debe tener al menos 2 caracteres'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const errorMap = {};
            errors.array().forEach(err => {
                if (!errorMap[err.path]) {
                    errorMap[err.path] = err.msg;
                }
            });
            
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errorMap
            });
        }
        next();
    }
];