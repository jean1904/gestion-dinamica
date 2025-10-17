export class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { token, tenant, user } = await this.authService.login(email, password);

            res.json({
                success: true,
                data: { token, tenant, user }
            });
        } catch (error) {
            next(error);
        }
    }
}
