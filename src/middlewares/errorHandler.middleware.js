import { logUnhandledError } from '#utils/errorHandler.util.js';

export const errorHandler = (err, req, res, next) => {
    if (err.isHandled) {
        return res.status(err.statusCode).json({
        success: false,
        code: err.code,
        message: req.t(err.messageKey, err.params || {}),
        });
    }
    
    // Error no manejado
    logUnhandledError(err);
    
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_ERROR',
        message: req.t('errors.server.internal'),
    });
};