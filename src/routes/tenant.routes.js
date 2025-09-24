import { Router } from 'express';
import {
  listTenants,
  getTenant,
  createTenantHandler,
  updateTenantHandler,
  deleteTenantHandler,
} from '../controllers/tenant.controller.js';

const router = Router();

// Obtener todos los tenants
router.get('/', listTenants);

// Obtener un tenant por ID
router.get('/:id', getTenant);

// Crear un nuevo tenant
router.post('/', createTenantHandler);

// Actualizar un tenant existente
router.put('/:id', updateTenantHandler);

// Eliminar un tenant
router.delete('/:id', deleteTenantHandler);

export default router;
