const express = require('express');
const router = express.Router();
const { stockIn, stockOut, adjustStock, getMovements } = require('../controllers/stockController');
const { protect } = require('../middleware/auth');

router.post('/in', protect, stockIn);
router.post('/out', protect, stockOut);
router.post('/adjust', protect, adjustStock);
router.get('/movements', protect, getMovements);

module.exports = router;
