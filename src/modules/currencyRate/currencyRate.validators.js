import { body } from 'express-validator';
import { handleValidationErrors } from '#middlewares/validation.middleware.js';

export const validateSaveTodayRates = [
    body('rates')
        .notEmpty().withMessage('errors.validation.required')
        .isArray({ min: 1 }).withMessage('errors.validation.must_be_array'),
    
    body('rates.*.currencyId')
        .notEmpty().withMessage('errors.validation.required')
        .isInt({ min: 1 }).withMessage('errors.validation.must_be_positive_integer'),
    
    body('rates.*.value')
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ gt: 0 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 8) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),

    handleValidationErrors
];