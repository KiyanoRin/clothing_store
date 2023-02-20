const { Account } = require('../models/db');

// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    Account.findByPk(req.accountId)
        .then(account => {
            if (account.role === 'admin') {
                next();
            } else {
                res.status(403).json({ error: 'Unauthorized' });
            }
        })
};

module.exports = {isAdmin};
  
