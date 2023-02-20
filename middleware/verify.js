require("dotenv").config();

const jwt = require('jsonwebtoken');

// Middleware function to verify the JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.accountId = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'log in please' });
  }
};

module.exports = {verifyToken};