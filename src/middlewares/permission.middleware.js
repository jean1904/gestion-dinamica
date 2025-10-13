import { db } from '../config/db.js';

export function checkPermission(module, action) {
    return async (req, res, next) => {
        const user = req.user;

        if (user.role === 'manager') {
            return next();
        }

        if (user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        try {
            const [rows] = await db.query(
                `SELECT * FROM permissions 
                WHERE user_id = ? AND module = ? AND action = ? AND granted = true`,
                [user.id, module, action]
            );

            if (rows.length === 0) {
                return res.status(403).json({
                success: false,
                message: `You don't have permission to ${action} ${module}`
                });
            }

            next();
        } catch (error) {
           
            res.status(500).json({ 
                success: false, 
                message: 'Permission check failed' 
            });
        }
    };
}