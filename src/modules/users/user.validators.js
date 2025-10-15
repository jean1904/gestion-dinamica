import { body } from 'express-validator';
import { handleValidationErrors } from '#middlewares/validation.middleware.js';

export const validateCreateUser = [
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

export const validateUpdateUser = [
    body('email')
        .optional()
        .isEmail().withMessage('errors.validation.email.invalid'),
    
    body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('errors.validation.min_length'),
    
    body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2 }).withMessage('errors.validation.min_length'),
    
    body('status')
        .optional()
        .isIn([0, 1]).withMessage('errors.validation.invalid'),
    
    handleValidationErrors
];