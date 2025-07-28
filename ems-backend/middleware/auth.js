const jwt = require('jsonwebtoken');

const authenticateJWT = () => (req, res, next) => {
  // Check for token in Authorization header
  let token = req.header('Authorization')?.split(' ')[1];
  
  // If no token in header, check for token in cookies
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, process.env.JWT_SECRET || 'ems_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

const checkRole = (roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
};


module.exports = { authenticateJWT, checkRole };