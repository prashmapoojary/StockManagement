const db = require('../config/db');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
const getStats = async (req, res, next) => {
  try {
    const totalProducts = await db.query('SELECT COUNT(*) FROM products');
    const lowStockCount = await db.query('SELECT COUNT(*) FROM products WHERE quantity < min_threshold');
    const movementsToday = await db.query("SELECT COUNT(*) FROM stock_movements WHERE created_at >= CURRENT_DATE");
    const totalValue = await db.query('SELECT SUM(quantity * unit_price) FROM products');

    res.json({
      success: true,
      data: {
        totalProducts: parseInt(totalProducts.rows[0].count),
        lowStockCount: parseInt(lowStockCount.rows[0].count),
        movementsToday: parseInt(movementsToday.rows[0].count),
        totalStockValue: parseFloat(totalValue.rows[0].sum || 0),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get 7-day movement trends
// @route   GET /api/dashboard/trends
const getTrends = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(CASE WHEN type = 'IN' THEN 1 END) as stock_in,
        COUNT(CASE WHEN type = 'OUT' THEN 1 END) as stock_out
      FROM stock_movements
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get top low stock products
// @route   GET /api/dashboard/low-stock
const getLowStock = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.name, p.sku, p.quantity, p.min_threshold, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.quantity < p.min_threshold
      ORDER BY p.quantity ASC
      LIMIT 10
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Get stock count per category
// @route   GET /api/dashboard/category-breakdown
const getCategoryBreakdown = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT c.name as name, SUM(p.quantity) as value
      FROM products p
      JOIN categories c ON p.category_id = c.id
      GROUP BY c.name
      ORDER BY value DESC
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getTrends, getLowStock, getCategoryBreakdown };
