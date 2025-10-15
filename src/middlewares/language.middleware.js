import i18n from '../config/i18n.js';

export const languageMiddleware = (req, res, next) => {
    let locale = req.query.lang || 
                 req.headers['accept-language']?.split(',')[0]?.split('-')[0] ||
                 req.user?.language ||
                 'es';

    const supportedLocales = ['en', 'es', 'pt'];
    if (!supportedLocales.includes(locale)) {
        locale = 'es';
    }

    i18n.setLocale(req, locale);
    
    req.locale = locale;
    
    next();
};