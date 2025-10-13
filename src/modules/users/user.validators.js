import { body, validationResult } from 'express-validator';

export const validateCreateUser = [
    body('email')
        .notEmpty().withMessage('Email requerido')
        .isEmail().withMessage('El formato del email es inválido'),
    
    body('password')
        .notEmpty().withMessage('contraseña requerida')
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('firstName')
        .notEmpty().withMessage('Nombre requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    
    body('lastName')
        .notEmpty().withMessage('Apellido requerido')
        .trim()
        .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
    
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

export const validateUpdateUser = [
    body('email')
        .optional()
        .isEmail().withMessage('El formato del email es inválido'),
    
    body('password')
        .optional()
        .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('El nombre debe tener al menos 2 caracteres'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('El apellido debe tener al menos 2 caracteres'),
    
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