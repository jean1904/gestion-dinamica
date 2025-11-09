import { body, validationResult } from 'express-validator';
import { AppError } from '#utils/errorHandler.util.js'; 

export const ValidateUpdatePrices = [
    body('modified_items')
        .optional()
        .isArray().withMessage('errors.validation.must_be_array'),
    
    body('modified_items.*.id')
        .if(body('modified_items').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isInt({ min: 1 }).withMessage('errors.validation.must_be_positive_integer'),
    

    body('modified_items.*.price_usd')
        .if(body('modified_items').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ min: 0 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 8) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),
    
    body('modified_items.*.price_ves')
        .if(body('modified_items').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ min: 0 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 8) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),
    
    body('modified_items.*.price_cash')
        .if(body('modified_items').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ min: 0 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 8) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),

    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return next(new AppError(
                'VALIDATION_ERROR',
                'errors.validation.invalid_price_data'
            ));
        }
        
        next();
    }
];