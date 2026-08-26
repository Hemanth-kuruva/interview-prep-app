const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token from Authorization header
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authorization token provided.',
    });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Token is missing.',
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'techprep_jwt_super_secret_key_2026_dev_secure';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
    });
  }
}

/**
 * Middleware to restrict access to specific roles (e.g. 'admin')
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Admin privileges are required to perform this action.',
    });
  }
  next();
}

module.exports = {
  verifyToken,
  requireAdmin,
};
