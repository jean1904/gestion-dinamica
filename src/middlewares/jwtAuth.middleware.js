import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function jwtAuthMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token requerido' });
  const token = authHeader.split(' ')[1];
  try {
    const info = jwt.verify(token, JWT_SECRET);
    req.token = info;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}
