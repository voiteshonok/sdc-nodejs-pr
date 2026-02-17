const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate JWT tokens
 * Extracts token from Authorization header and verifies it
 */
const authenticateToken = (jwtSecret) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).send({ 
        success: false,
        error: 'Access token is required. Please provide a valid JWT token in the Authorization header.' 
      });
    }

    try {
      const decoded = jwt.verify(token, jwtSecret);
      
      req.user = decoded;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).send({ 
          success: false,
          error: 'Token has expired. Please login again.' 
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).send({ 
          success: false,
          error: 'Invalid token. Please provide a valid JWT token.' 
        });
      } else {
        return res.status(500).send({ 
          success: false,
          error: 'Token verification failed.' 
        });
      }
    }
  };
};

module.exports = { authenticateToken };

