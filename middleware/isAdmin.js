const { Account } = require("../models/db");

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
  try {
    const role = res.locals.decoded.role;
    if (role === "admin") next();
    else res.send("khong co quyen");
  } catch (error) {
    res.send(error);
  }
};

module.exports = { isAdmin };
