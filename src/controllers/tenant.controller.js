import {
  getAllTenants,
  getTenantById,
  createTenant,
  updateTenant,
  deleteTenant,
} from '../models/tenant.model.js';

// GET /api/tenants
export async function listTenants(req, res) {
  try {
    const tenants = await getAllTenants();
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/tenants/:id
export async function getTenant(req, res) {
  try {
    const tenant = await getTenantById(req.params.id);
    if (!tenant) return res.status(404).json({ error: 'Tenant no encontrado' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/tenants
export async function createTenantHandler(req, res) {
  try {
    const { name } = req.body;
    const tenant = await createTenant(name);
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/tenants/:id
export async function updateTenantHandler(req, res) {
  try {
    const { name } = req.body;
    const tenant = await updateTenant(req.params.id, name);
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/tenants/:id
export async function deleteTenantHandler(req, res) {
  try {
    await deleteTenant(req.params.id);
    res.json({ message: 'Tenant eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
