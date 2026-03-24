const db = require('../config/db');
const { getIO } = require('../config/socket');
const { sendEmail } = require('../config/mailer');

/**
 * Creates a notification and emits it via socket.io.
 */
const createNotification = async ({ productId, type, message }) => {
  try {
    const res = await db.query(
      'INSERT INTO notifications (product_id, type, message) VALUES ($1, $2, $3) RETURNING id, created_at',
      [productId, type, message]
    );

    const io = getIO();
    // Emit to all users for now, or to specific rooms if needed
    io.emit('notification:new', {
      id: res.rows[0].id,
      type,
      message,
      product_id: productId,
      created_at: res.rows[0].created_at,
    });

    // Send email alert for low stock
    if (type === 'LOW' || type === 'OUT') {
      try {
        await sendEmail({
          to: 'prashmapoojary@gmail.com',
          subject: 'Stock Alert - Warehouse Monitor',
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #fee2e2; border-left: 4px solid #ef4444;">
              <h2 style="color: #ef4444; margin-top: 0;">⚠️ Stock Alert</h2>
              <p><strong>Alert Type:</strong> ${type === 'LOW' ? 'Low Stock' : 'Out of Stock'}</p>
              <p><strong>Message:</strong> ${message}</p>
              <hr style="border: 0; border-top: 1px solid #fee2e2; margin: 20px 0;" />
              <p style="font-size: 12px; color: #6b7280;">Warehouse Monitoring System • Automated Alert</p>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send stock alert email:', emailErr);
      }
    }

    return res.rows[0];
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

module.exports = { createNotification };
