import { body } from 'express-validator';
import { handleValidationErrors } from '#middlewares/validation.middleware.js';

export const validateCreateTenant = [
    body('name')
        .notEmpty().withMessage('errors.validation.required')
        .trim()
        .isLength({ min: 2 }).withMessage('errors.validation.min_length'),
    body('email')
        .notEmpty().withMessage('errors.validation.required')
        .isEmail().withMessage('errors.validation.invalid'),
    
    body('firstName')
        .notEmpty().withMessage('errors.validation.required')
        .trim()
        .isLength({ min: 2 }).withMessage('errors.validation.min_length'),
    
    body('lastName')
        .notEmpty().withMessage('errors.validation.required')
        .trim()
        .isLength({ min: 2 }).withMessage('errors.validation.min_length'),
    
    handleValidationErrors
];


export const validateUpdateTenant = [
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('errors.validation.min_length'),
    
    
    handleValidationErrors
];