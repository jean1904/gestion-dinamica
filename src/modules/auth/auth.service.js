import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppError } from '#utils/errorHandler.util.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '10h';

export class AuthService {
    constructor(authRepository) {
        this.authRepository = authRepository;
    }

    async login(email, password) {
        const user = await this.authRepository.findByEmail(email);
        if (!user) {
            throw new AppError('AUTHENTICATION_ERROR', 'errors.auth.invalid_credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('AUTHENTICATION_ERROR', 'errors.auth.invalid_credentials');
        }

    
        const token = jwt.sign({
            tenant: {
                id: user.tenant_id,
                name: user.name,
            },
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
            }
        },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
        );
        
        return {
            token,
            tenant: {
                id: user.tenant_id,
                name: user.name,
            },
            user: {
                id: user.user_id,
                email: user.email,
                role: user.role,
                firstName: user.first_name,
                lastName: user.last_name,
            }
        };
    }
}
