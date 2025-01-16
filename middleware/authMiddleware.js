const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    // Retrieve the token from the Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1]; // Extract the token part after 'Bearer'
    if (!token) {
      return res.status(401).json({ message: 'Access denied. Token is missing.' });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach userId from the token payload to req object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    // Handle specific JWT errors for better debugging
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    } else {
      return res.status(500).json({ message: 'An error occurred during token verification' });
    }
  }
};

module.exports = { verifyToken };
