import { body } from 'express-validator'
import { handleValidationErrors } from '#middlewares/validation.middleware.js'

export const validateLogin = [
    body('email')
        .notEmpty().withMessage('errors.validation.required')
        .isEmail().withMessage('errors.validation.invalid'),

    body('password')
        .notEmpty().withMessage('errors.validation.required')
        .isLength({ min: 6 }).withMessage('errors.validation.min_length'),

    handleValidationErrors
]