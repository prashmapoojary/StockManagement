const db = require('../config/db');
const { getIO } = require('../config/socket');

/**
 * Updates product quantity and records the movement.
 * Also checks for low stock and emits real-time events.
 */
const updateStock = async ({ productId, type, quantity, reason, performedBy }) => {
  const client = await db.pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get current product data
    const productRes = await client.query(
      'SELECT id, name, sku, quantity, min_threshold, warehouse_id FROM products WHERE id = $1 FOR UPDATE',
      [productId]
    );

    if (productRes.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productRes.rows[0];
    const previousQty = product.quantity;
    let newQty = previousQty;

    if (type === 'IN') {
      newQty += quantity;
    } else if (type === 'OUT') {
      if (previousQty < quantity) {
        throw new Error('Insufficient stock');
      }
      newQty -= quantity;
    } else if (type === 'ADJUSTMENT') {
      newQty = quantity;
    }

    // 2. Update product quantity
    await client.query(
      'UPDATE products SET quantity = $1, updated_at = NOW() WHERE id = $2',
      [newQty, productId]
    );

    // 3. Record stock movement
    const movementRes = await client.query(
      `INSERT INTO stock_movements (product_id, type, quantity, previous_qty, new_qty, reason, performed_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
      [productId, type, type === 'ADJUSTMENT' ? newQty - previousQty : quantity, previousQty, newQty, reason, performedBy]
    );

    await client.query('COMMIT');

    // 4. Real-time notifications (Socket.io)
    const io = getIO();
    const warehouseRoom = `warehouse_${product.warehouse_id}`;

    io.to(warehouseRoom).emit('stock:updated', {
      productId: product.id,
      productName: product.name,
      newQty,
      previousQty,
      type,
    });

    // Check for low stock alerts (Trigger in DB handles the insert, but we can emit)
    if (newQty < product.min_threshold && previousQty >= product.min_threshold) {
      io.to(warehouseRoom).emit('stock:low', {
        productId: product.id,
        productName: product.name,
        currentQty: newQty,
        minThreshold: product.min_threshold,
      });
    } else if (newQty === 0 && previousQty > 0) {
      io.to(warehouseRoom).emit('stock:out', {
        productId: product.id,
        productName: product.name,
      });
    }

    return {
      success: true,
      data: {
        movementId: movementRes.rows[0].id,
        newQty,
      },
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { updateStock };
