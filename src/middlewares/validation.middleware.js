import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMap = {};
        errors.array().forEach(err => {
            if (!errorMap[err.path]) {
                errorMap[err.path] = req.t(err.msg, { 
                    field: req.t(`fields.${err.path}`)
                });
            }
        });
        
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: req.t('errors.validation.failed'),
            errors: errorMap
        });
    }
    
    next();
};