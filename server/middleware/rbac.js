const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role.toLowerCase() === role.toLowerCase()) {
      next();
    } else {
      res.status(403).json({ success: false, message: `Access denied. ${role} role required.` });
    }
  };
};

module.exports = { requireRole };
