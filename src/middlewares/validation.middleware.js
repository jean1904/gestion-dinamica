import { validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMap = {};
        errors.array().forEach(err => {
            if (!errorMap[err.path]) {
                errorMap[err.path] = req.t(err.msg, { 
                    field: req.t(getFieldTranslationKey(err.path))
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

function getFieldTranslationKey(path) {
    // Si es un campo de array como 'details[0].currencyId'
    const arrayMatch = path.match(/^(\w+)\[\d+\]\.(\w+)$/);
    if (arrayMatch) {
        const [, arrayName, fieldName] = arrayMatch;
        // Retorna 'fields.currencyId' en lugar de 'fields.details[0].currencyId'
        return `fields.${fieldName}`;
    }
    
    // Para campos normales
    return `fields.${path}`;
}