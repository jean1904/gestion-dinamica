import express from 'express';
import tenantRoutes from './routes/tenant.routes.js';
import authRoutes from './routes/auth.routes.js';
/*import supplierRoutes from './routes/supplier.routes.js';
import itemRoutes from './routes/item.routes.js';
import priceRoutes from './routes/price.routes.js';*/
import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/errorHandler.middleware.js';

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tenants', authMiddleware, tenantRoutes);
/*app.use('/api/suppliers', supplierRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/prices', priceRoutes);*/
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
