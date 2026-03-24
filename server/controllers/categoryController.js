const db = require('../config/db');

// @desc    Get categories
// @route   GET /api/categories
const getCategories = async (req, res, next) => {
  const { warehouse_id } = req.query;
  try {
    let query = 'SELECT * FROM categories WHERE 1=1';
    const params = [];

    if (warehouse_id) {
      params.push(warehouse_id);
      query += ` AND warehouse_id = $${params.length}`;
    }

    query += ' ORDER BY name ASC';
    const result = await db.query(query, params);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
const createCategory = async (req, res, next) => {
  const { name, description, warehouse_id } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO categories (name, description, warehouse_id) VALUES ($1, $2, $3) RETURNING *',
      [name, description, warehouse_id]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
const updateCategory = async (req, res, next) => {
  const { name, description } = req.body;
  try {
    const result = await db.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
const deleteCategory = async (req, res, next) => {
  try {
    await db.query('DELETE FROM categories WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
