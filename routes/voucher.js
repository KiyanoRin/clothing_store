const express = require('express');
const router = express.Router();
const {Voucher} = require('../models/db');

// GET all accounts
router.get('/', (req, res) => {
    Voucher.findAll()
    .then(voucher => {
      res.status(200).json({
        message: 'Successfully retrieved all accounts',
        voucher
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

module.exports = router;