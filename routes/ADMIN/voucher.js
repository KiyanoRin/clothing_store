const express = require('express');
const router = express.Router();
const {Voucher} = require('../../models/db');

// GET all accounts
router.get('/', (req, res) => {
    Voucher.findAll({attributes: ['voucherId', 'discount', 'limit']})
    .then(voucher => {
      res.status(200).json({
        voucher
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

// POST a new voucher
router.post('/', (req, res) => {
    const {discount, limit} = req.body;
    Voucher.create({discount, limit})
        .then(voucher => {
            res.status(201).json({
                message: 'Voucher created successfully',
                voucher
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error.message
            });
        });
});

// UPDATE an existing voucher
router.put('/', (req, res) => {
    const {voucherId, discount, limit} = req.body;
    Voucher.update({discount, limit}, {where: {voucherId}})
        .then(() => {
            res.status(200).json({
                message: 'Voucher updated successfully'
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error.message
            });
        });
});

// DELETE an existing voucher
router.delete('/', (req, res) => {
    const voucherId = req.body.voucherId;
    Voucher.destroy({where: {voucherId}})
        .then(() => {
            res.status(200).json({
                message: 'Voucher deleted successfully'
            });
        })
        .catch(error => {
            res.status(500).json({
                error: error.message
            });
        });
});


module.exports = router;