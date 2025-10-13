import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function jwtAuthMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
    
    const token = authHeader.split(' ')[1];
    
    try {
		const decoded = jwt.verify(token, JWT_SECRET);
		
		req.user = {
			id: decoded.user.id,
			email: decoded.user.email,
			role: decoded.user.role,
			firstName: decoded.user.firstName,
			lastName: decoded.user.lastName,
			tenant_id: decoded.tenant.id,
			tenantName: decoded.tenant.name
		};

		req.tokenData = decoded;
		
		next();
    } catch {
      	return res.status(401).json({ error: 'Token inválido' });
    }
}