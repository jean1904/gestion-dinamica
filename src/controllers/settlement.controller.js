import {
  saveBatchEntry
} from '../services/settlement.service.js';

// POST /api/settlements
export async function createBatchHandler(req, res) {
  try {
    const { items, operatingCosts = [] } = req.body;

    let tenantId = req.token.tenant.id
    const batch = await saveBatchEntry({ items, operatingCosts, tenantId });
    res.status(201).json(batch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
