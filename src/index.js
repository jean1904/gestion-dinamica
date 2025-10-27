import express from 'express';
import cors from 'cors';
import i18n from './config/i18n.js';

import itemRoutes from './routes/item.routes.js';
import settlementRoutes from './routes/settlement.routes.js';
/*import supplierRoutes from './routes/supplier.routes.js';
import priceRoutes from './routes/price.routes.js';*/

import { errorHandler } from '#middlewares/errorHandler.middleware.js';
import { languageMiddleware } from '#middlewares/language.middleware.js';

import authRoutes from '#modules/auth/auth.routes.js';

import userRoutes from '#modules/users/user.routes.js';
import permissionRoutes from '#modules/permissions/permission.routes.js';

import currencyRateRoutes from '#modules/currencyRate/currencyRate.routes.js';

import tenantRoutes from '#modules/tenants/tenant.routes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(i18n.init);
app.use(languageMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/settlement', settlementRoutes);

app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/currency-rates', currencyRateRoutes);

app.use('/api/admin/tenants', tenantRoutes);

/*app.use('/api/suppliers', supplierRoutes);
app.use('/api/prices', priceRoutes);*/

// Middleware de manejo de errores
app.use(errorHandler);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
