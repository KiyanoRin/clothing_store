require("dotenv").config();

const express = require('express');
const router = express.Router();
const {Account, User} = require('../models/db');
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

// GET a single account by ID
router.get('/',verifyToken, (req, res) => {
  Account.findByPk(req.accountId)
    .then(account => {
      if (!account) {
        return res.status(404).json({
          message: `Account with ID ${req.query.accountId} not found`
        });
      }
      res.status(200).json({
        message: `Successfully retrieved account with ID ${req.query.accountId}`,
        account: account
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});


/* // POST a new account
router.post('/', (req, res) => {

   Account.create(req.body)
    .then(account => {
      res.status(201).json({
        message: 'Successfully created a new account',
        account
      });
    })
    .catch(error => {
      res.status(400).json({
        error: error
      });
    }); 
}); */

// PUT (update) an existing account
router.put('/', (req, res) => {
  Account.findByPk(req.query.accountId)
    .then(account => {
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      return account.update(req.body)
        .then(() => {
          res.status(200).json({ message: 'Account updated successfully' });
        });
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });

});


/* // DELETE a specific account
router.delete('/', (req, res) => {
  Account.destroy({ where: { accountId: req.query.accountId } })
    .then(() => {
      res.status(200).json({
        message: `Successfully deleted account with ID ${req.query.accountId}`
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
}); */

/* // GET all accounts
router.get('/', (req, res) => {
  Account.findAll()
    .then(accounts => {
      res.status(200).json({
        message: 'Successfully retrieved all accounts',
        accounts
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
}); */

module.exports = router;
