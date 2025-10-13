export class TenantResource {
    static transform(tenant) {
        if (!tenant) return null;

        return {
            id: tenant.id,
            name: tenant.name,
            status: tenant.status === 1 ? 'active' : 'inactive',
            createdAt: tenant.created_at,
            updatedAt: tenant.updated_at
        };
    }

    static collection(tenants) {
        return tenants.map(tenant => this.transform(tenant));
    }
}