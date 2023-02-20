const express = require('express');
const router = express.Router();
const {Account, User, LoyaltyProgram} = require('../models/db');

// GET a single account by ID
router.get('/', async (req, res) => {
  Account.findByPk(req.accountId, {
    include: User,
    as: 'user'
  })
    .then(account => {
      LoyaltyProgram.findOne({where: {accountId: req.accountId}})
        .then(loyaltyProgram => {
          res.status(200).json({
            accountId: req.accountId,
            name: account.user.name,
            phone: account.user.phone,
            role: account.role,
            address: account.address,
            loyaltyPoints: loyaltyProgram.points
          });
        })   
    })
    .catch(error => {
      console.log(error);
      res.status(500).json({
        error: error
      });
    });
});

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

module.exports = router;
