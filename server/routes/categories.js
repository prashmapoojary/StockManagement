const express = require('express');
const router = express.Router();
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.get('/', protect, getCategories);
router.post('/', protect, requireRole('admin'), createCategory);
router.put('/:id', protect, requireRole('admin'), updateCategory);
router.delete('/:id', protect, requireRole('admin'), deleteCategory);

module.exports = router;
