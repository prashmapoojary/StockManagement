const express = require('express');
const router = express.Router();
const { getStats, getTrends, getLowStock, getCategoryBreakdown } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, getStats);
router.get('/trends', protect, getTrends);
router.get('/low-stock', protect, getLowStock);
router.get('/category-breakdown', protect, getCategoryBreakdown);

module.exports = router;
