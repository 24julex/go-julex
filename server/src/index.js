import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './db.js';
import { seedDatabase } from './seed.js';

// Route imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import brandRoutes from './routes/brands.js';
import orderRoutes from './routes/orders.js';
import adminRoutes from './routes/admin.js';
import couponRoutes from './routes/coupons.js';
import invoiceRoutes from './routes/invoices.js';
import uploadRoutes from './routes/upload.js';
import superAdminRoutes from './routes/superAdmin.js';
import customerRoutes from './routes/customers.js';
import themeRoutes from './routes/themes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
app.use(cors({
  origin: CORS_ORIGIN === '*' ? '*' : CORS_ORIGIN.split(',').map((o) => o.trim()),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(morgan('dev'));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Go Julex Multi-Tenant D2C Commerce SaaS REST API',
    currency: 'INR (₹)',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api', invoiceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/themes', themeRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error.' });
});

// Start Server & Check Database
async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Go Julex SaaS Backend API running on http://localhost:${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start Go Julex server:', error);
    process.exit(1);
  }
}

startServer();
