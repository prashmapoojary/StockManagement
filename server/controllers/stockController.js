const { updateStock } = require('../services/stockService');
const db = require('../config/db');

// @desc    Record Stock IN movement
// @route   POST /api/stock/in
const stockIn = async (req, res, next) => {
  const { product_id, quantity, reason } = req.body;

  try {
    const result = await updateStock({
      productId: product_id,
      type: 'IN',
      quantity: parseInt(quantity),
      reason,
      performedBy: req.user.id,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Record Stock OUT movement
// @route   POST /api/stock/out
const stockOut = async (req, res, next) => {
  const { product_id, quantity, reason } = req.body;

  try {
    const result = await updateStock({
      productId: product_id,
      type: 'OUT',
      quantity: parseInt(quantity),
      reason,
      performedBy: req.user.id,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Adjust Stock quantity
// @route   POST /api/stock/adjust
const adjustStock = async (req, res, next) => {
  const { product_id, new_quantity, reason } = req.body;

  try {
    const result = await updateStock({
      productId: product_id,
      type: 'ADJUSTMENT',
      quantity: parseInt(new_quantity),
      reason,
      performedBy: req.user.id,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get movement history
// @route   GET /api/stock/movements
const getMovements = async (req, res, next) => {
  const { product_id, type, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT m.*, p.name as product_name, p.sku as product_sku, u.name as user_name
      FROM stock_movements m
      JOIN products p ON m.product_id = p.id
      JOIN users u ON m.performed_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (product_id) {
      params.push(product_id);
      query += ` AND m.product_id = $${params.length}`;
    }

    if (type) {
      params.push(type);
      query += ` AND m.type = $${params.length}`;
    }

    query += ` ORDER BY m.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const movements = await db.query(query, params);
    res.json({ success: true, data: movements.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { stockIn, stockOut, adjustStock, getMovements };
