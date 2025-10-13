import express from 'express';
import cors from 'cors';
//import tenantRoutes from './routes/tenant.routes.js';
import authRoutes from './routes/auth.routes.js';
import itemRoutes from './routes/item.routes.js';
import settlementRoutes from './routes/settlement.routes.js';
/*import supplierRoutes from './routes/supplier.routes.js';
import priceRoutes from './routes/price.routes.js';*/
import { jwtAuthMiddleware } from './middlewares/jwtAuth.middleware.js';

// Middlewares
import { tenantMiddleware } from './middlewares/tenant.middleware.js';
import { adminMiddleware } from './middlewares/admin.middleware.js';

import userRoutes from './modules/users/user.routes.js';
import permissionRoutes from './modules/permissions/permission.routes.js';

import tenantRoutes from './modules/tenants/tenant.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
//app.use('/api/tenants', jwtAuthMiddleware, tenantRoutes);
app.use('/api/items', jwtAuthMiddleware, itemRoutes);
app.use('/api/settlement', jwtAuthMiddleware, settlementRoutes);

app.use('/api/users', jwtAuthMiddleware, tenantMiddleware, userRoutes);
app.use('/api/permissions', jwtAuthMiddleware, tenantMiddleware, permissionRoutes);

app.use('/api/admin/tenants', jwtAuthMiddleware, adminMiddleware, tenantRoutes);

/*app.use('/api/suppliers', supplierRoutes);
app.use('/api/prices', priceRoutes);*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
