export class UserResource {
    static transform(user) {
        if (!user) return null;

        return {
            id: user.id,
            firstName: user.first_name,
            lastName: user.last_name,
            fullName: `${user.first_name} ${user.last_name}`,
            email: user.email,
            role: user.role,
            status: user.status === 1 ? 'active' : 'inactive',
            createdAt: user.created_at,
            updatedAt: user.updated_at
        };
    }

    static collection(users) {
        return users.map(user => this.transform(user));
    }
}