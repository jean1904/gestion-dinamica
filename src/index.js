import express from 'express';
import cors from 'cors';
import tenantRoutes from './routes/tenant.routes.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
/*import supplierRoutes from './routes/supplier.routes.js';
import priceRoutes from './routes/price.routes.js';*/
import { jwtAuthMiddleware } from './middlewares/jwtAuth.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tenants', jwtAuthMiddleware, tenantRoutes);
app.use('/api/items', jwtAuthMiddleware, itemRoutes);
/*app.use('/api/suppliers', supplierRoutes);
app.use('/api/prices', priceRoutes);*/
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
