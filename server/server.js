/**
 * Server Entry Point — Nandhipriya Electricals API
 * Mounts all routes, middleware, and starts the Express server.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const saleRoutes = require('./routes/saleRoutes');
const stockLogRoutes = require('./routes/stockLogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// ─── Global Middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock-logs', stockLogRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ─── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});
