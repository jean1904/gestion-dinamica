import { Router } from 'express';
import {
  listItems,
  getItem,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler,
  searchByBarcodeHandler,
  searchByNameHandler,
} from '../controllers/item.controller.js';

import { jwtAuthMiddleware } from '#middlewares/jwtAuth.middleware.js';

const router = Router();
router.use(jwtAuthMiddleware);

// Obtener todos los items
router.get('/', listItems);

// Obtener un item por ID
router.get('/:id', getItem);

// Crear un nuevo item
router.post('/', createItemHandler);

// Actualizar un item existente
router.put('/:id', updateItemHandler);

// Eliminación lógica de un item
router.delete('/:id', deleteItemHandler);

// Buscar item por código de barras
router.get('/search/barcode/:barcode', searchByBarcodeHandler);

// Buscar item por nombre
router.get('/search/name/:name', searchByNameHandler);

export default router;
