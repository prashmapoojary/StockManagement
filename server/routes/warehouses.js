const express = require('express');
const router = express.Router();
const { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } = require('../controllers/warehouseController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', protect, getWarehouses);
router.post('/', protect, requireRole('admin'), createWarehouse);
router.put('/:id', protect, requireRole('admin'), updateWarehouse);
router.delete('/:id', protect, requireRole('admin'), deleteWarehouse);

module.exports = router;
