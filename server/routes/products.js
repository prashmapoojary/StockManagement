const express = require('express');
const router = express.Router();
const { getProducts, createProduct, getProductById, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', getProducts);
router.post('/', protect, requireRole('admin'), createProduct);
router.get('/:id', getProductById);
router.put('/:id', protect, requireRole('admin'), updateProduct);
router.delete('/:id', protect, requireRole('admin'), deleteProduct);

module.exports = router;
