import { body, validationResult } from 'express-validator';
import { AppError } from '#utils/errorHandler.util.js'; 
import { handleValidationErrors } from '#middlewares/validation.middleware.js';

export const validateCreateBatchEntry = [
    // Warehouse
    body('warehouseId')
        .notEmpty().withMessage('errors.validation.required')
        .isInt({ min: 1 }).withMessage('errors.validation.must_be_positive_integer'),
    
    // items array (obligatorio, mínimo 1)
    body('items')
        .notEmpty().withMessage('errors.validation.required')
        .isArray({ min: 1 }).withMessage('errors.validation.must_be_array'),
    
    // items - itemId
    body('items.*.itemId')
        .notEmpty().withMessage('errors.validation.required')
        .isInt({ min: 1 }).withMessage('errors.validation.must_be_positive_integer'),
    
    // items - quantity
    body('items.*.quantity')
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ min: 0.001 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 3) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),
    
    // items - unitPrice
    body('items.*.unitPrice')
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ min: 0.001 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 8) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),
    
    // items - currencyId
    body('items.*.currencyId')
        .notEmpty().withMessage('errors.validation.required')
        .isInt({ min: 1 }).withMessage('errors.validation.must_be_positive_integer'),

    // ========== COSTOS OPERACIONALES (OPCIONAL) ==========

    body('operationalCosts')
        .optional()
        .isArray().withMessage('errors.validation.must_be_array'),

    body('operationalCosts.*.name')
        .if(body('operationalCosts').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isString().withMessage('errors.validation.must_be_string')
        .trim()
        .isLength({ min: 1, max: 255 }).withMessage('errors.validation.length_between'),
    
    body('operationalCosts.*.amount')
        .if(body('operationalCosts').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isFloat({ min: 0.01 }).withMessage('errors.validation.must_be_positive_number')
        .custom((value) => {
            const decimals = value.toString().split('.')[1];
            if (decimals && decimals.length > 2) {
                throw new Error('errors.validation.max_decimals');
            }
            return true;
        }),
    body('operationalCosts.*.currencyId')
        .if(body('operationalCosts').exists())
        .notEmpty().withMessage('errors.validation.required')
        .isInt({ min: 1 }).withMessage('errors.validation.must_be_positive_integer'),

    handleValidationErrors
];