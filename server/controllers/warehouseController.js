const db = require('../config/db');

// @desc    Get all warehouses
// @route   GET /api/warehouses
const getWarehouses = async (req, res, next) => {
  try {
    const result = await db.query('SELECT w.*, u.name as manager_name FROM warehouses w LEFT JOIN users u ON w.manager_id = u.id ORDER BY w.name ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Create warehouse
// @route   POST /api/warehouses
const createWarehouse = async (req, res, next) => {
  const { name, location, capacity, manager_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO warehouses (name, location, capacity, manager_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, location, capacity, manager_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update warehouse
// @route   PUT /api/warehouses/:id
const updateWarehouse = async (req, res, next) => {
  const { name, location, capacity, manager_id } = req.body;
  try {
    const result = await db.query(
      'UPDATE warehouses SET name = $1, location = $2, capacity = $3, manager_id = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, location, capacity, manager_id, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete warehouse
// @route   DELETE /api/warehouses/:id
const deleteWarehouse = async (req, res, next) => {
  try {
    await db.query('DELETE FROM warehouses WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse };
