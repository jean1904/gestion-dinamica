import { Router } from 'express';
import {
  createBatchHandler
} from '../controllers/settlement.controller.js';

const router = Router();


// Crear un nuevo item
router.post('/', createBatchHandler);

export default router;
