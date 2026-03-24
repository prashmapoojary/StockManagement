const db = require('../config/db');

// @desc    Get all notifications
// @route   GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { is_read, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = '';
    const values = [];

    if (is_read !== undefined) {
      whereClause = 'WHERE n.is_read = $1';
      values.push(is_read === 'true');
    }

    const result = await db.query(
      `SELECT
         n.id,
         n.type,
         n.message,
         n.is_read,
         n.created_at,
         n.product_id,
         p.name  AS product_name,
         p.sku   AS product_sku
       FROM notifications n
       LEFT JOIN products p ON n.product_id = p.id
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, offset]
    );

    const countResult = await db.query(
      `SELECT COUNT(*) FROM notifications n ${whereClause}`,
      values
    );

    const unreadResult = await db.query(
      `SELECT COUNT(*) FROM notifications WHERE is_read = false`
    );

    res.json({
      success: true,
      data: {
        notifications: result.rows,
        totalItems:    parseInt(countResult.rows[0].count),
        unreadCount:   parseInt(unreadResult.rows[0].count),
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const result = await db.query('UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all unread notifications as read
// @route   POST /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await db.query('UPDATE notifications SET is_read = true WHERE is_read = false');
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res, next) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = $1', [req.params.id]);
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    next(error);
  }
};

module.exports = { getNotifications, markAsRead, markAllRead, deleteNotification };
