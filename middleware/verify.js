require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log(token);
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log(decoded);
    res.locals.decoded = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "log in please" });
  }
};

module.exports = { verifyToken };
