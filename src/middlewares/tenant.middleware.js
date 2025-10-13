export function tenantMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role === 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Admin cannot access tenant operations'
        });
    }
    
    next();
}

export function managerMiddleware(req, res, next) {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'manager') {
        return res.status(403).json({
            success: false,
            message: 'Only managers can perform this action',
        });
    }
  
    next();
}