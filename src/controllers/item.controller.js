import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  searchItemByBarcode,
  searchItemByName,
} from '../models/item.model.js';

// GET /api/items
export async function listItems(req, res) {
  try {
    const items = await getAllItems(req.user.tenant_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/items/:id
export async function getItem(req, res) {
  try {
    const item = await getItemById(req.params.id, req.user.tenant_id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// POST /api/items
export async function createItemHandler(req, res) {
  try {
    const { name, barcode } = req.body;

    if(barcode && barcode !== '') {
        const alreadyExists = await searchItemByBarcode(barcode, req.user.tenant_id);
        if (alreadyExists.length > 0) {
            return res.status(400).json({ error: 'El código de barras ya existe' });
        }
    }
    const item = await createItem({ name, barcode, tenantId: req.user.tenant_id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// PUT /api/items/:id
export async function updateItemHandler(req, res) {
  try {
    const { name, barcode } = req.body;
    const item = await updateItem(req.params.id, { name, barcode, tenantId: req.user.tenant_id });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// DELETE /api/items/:id
export async function deleteItemHandler(req, res) {
  try {
    await deleteItem(req.params.id, req.user.tenant_id);
    res.json({ message: 'Item eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/items/search/barcode/:barcode
export async function searchByBarcodeHandler(req, res) {
  try {
    const items = await searchItemByBarcode(req.params.barcode, req.user.tenant_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/items/search/name/:name
export async function searchByNameHandler(req, res) {
  try {
    const items = await searchItemByName(req.params.name, req.user.tenant_id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
