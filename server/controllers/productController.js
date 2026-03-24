const db = require('../config/db');

// @desc    Get all products
// @route   GET /api/products
// @access  Public (or semi-private)
const getProducts = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.max(1, parseInt(req.query.limit) || 10);
    const offset   = (page - 1) * limit;
    const search   = req.query.search   || '';
    const category = req.query.category || '';
    const status   = req.query.status   || '';

    // Build dynamic WHERE clause
    const conditions = [];
    const values     = [];
    let   paramIndex = 1;

    if (search) {
      conditions.push(
        `(p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`
      );
      values.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`p.category_id = $${paramIndex}`);
      values.push(category);
      paramIndex++;
    }

    if (status === 'OUT_OF_STOCK') {
      conditions.push(`p.quantity = 0`);
    } else if (status === 'LOW_STOCK') {
      conditions.push(`p.quantity > 0 AND p.quantity < p.min_threshold`);
    } else if (status === 'IN_STOCK') {
      conditions.push(`p.quantity >= p.min_threshold`);
    }

    const whereClause = conditions.length > 0
      ? 'WHERE ' + conditions.join(' AND ')
      : '';

    // COUNT query (no limit/offset)
    const countResult = await db.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      values
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // DATA query (with limit/offset)
    const dataResult = await db.query(
      `SELECT 
         p.id, p.sku, p.name, p.description,
         p.quantity, p.min_threshold, p.max_threshold,
         p.unit_price, p.unit, p.location_code,
         p.created_at, p.updated_at,
         c.id   AS category_id,
         c.name AS category_name,
         w.id   AS warehouse_id,
         w.name AS warehouse_name,
         CASE
           WHEN p.quantity = 0               THEN 'OUT_OF_STOCK'
           WHEN p.quantity < p.min_threshold THEN 'LOW_STOCK'
           ELSE 'IN_STOCK'
         END AS stock_status
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN warehouses  w ON p.warehouse_id = w.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...values, limit, offset]
    );

    res.json({
      success: true,
      data: {
        products:   dataResult.rows,
        pagination: {
          currentPage:  page,
          totalPages:   totalPages,
          totalItems:   totalItems,
          itemsPerPage: limit,
          hasNextPage:  page < totalPages,
          hasPrevPage:  page > 1,
          showing: {
            from: totalItems === 0 ? 0 : offset + 1,
            to:   Math.min(offset + limit, totalItems),
            of:   totalItems,
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Admin
const createProduct = async (req, res, next) => {
  const { sku, name, description, category_id, warehouse_id, unit, quantity, min_threshold, max_threshold, unit_price, location_code } = req.body;

  try {
    const newProduct = await db.query(
      `INSERT INTO products (sku, name, description, category_id, warehouse_id, unit, quantity, min_threshold, max_threshold, unit_price, location_code, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [sku, name, description, category_id, warehouse_id, unit, quantity, min_threshold, max_threshold, unit_price, location_code, req.user.id]
    );

    res.status(201).json({ success: true, data: newProduct.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await db.query(
      `SELECT p.*, c.name as category_name, w.name as warehouse_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN warehouses w ON p.warehouse_id = w.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: product.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = async (req, res, next) => {
  const { name, description, category_id, warehouse_id, unit, min_threshold, max_threshold, unit_price, location_code } = req.body;

  try {
    const updatedProduct = await db.query(
      `UPDATE products SET name = $1, description = $2, category_id = $3, warehouse_id = $4, unit = $5, min_threshold = $6, max_threshold = $7, unit_price = $8, location_code = $9, updated_at = NOW()
       WHERE id = $10 RETURNING *`,
      [name, description, category_id, warehouse_id, unit, min_threshold, max_threshold, unit_price, location_code, req.params.id]
    );

    if (updatedProduct.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: updatedProduct.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = async (req, res, next) => {
  try {
    const deletedProduct = await db.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);

    if (deletedProduct.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProducts, createProduct, getProductById, updateProduct, deleteProduct };
