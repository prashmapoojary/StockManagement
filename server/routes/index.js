const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./products');
const stockRoutes = require('./stock');
const notificationRoutes = require('./notifications');
const warehouseRoutes = require('./warehouses');
const categoryRoutes = require('./categories');
const dashboardRoutes = require('./dashboard');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/stock', stockRoutes);
router.use('/notifications', notificationRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
