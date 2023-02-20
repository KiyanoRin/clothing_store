require("dotenv").config();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const { Account, User } = require('../models/db');
const jwt = require('jsonwebtoken');

router.get('/login', (req, res) => {
  res.render('login');
});

// Login
router.post('/login', (req, res) => {
  const { phone, password } = req.body;
  User.findOne({ where: { phone: phone } })
    .then(user => {
      Account.findOne({ where: { userId: user.userId } })
        .then(account => {
          console.log(password);
          bcrypt.compare(password, account.password, (err, result) => {
            if (err) {
              return res.status(401).json({ error: `Incorrect password` });
            }
            const token = jwt.sign(account.accountId, process.env.JWT_SECRET);
            res.status(200).json(token);
          });
        })
        .catch(error => {
          res.status(500).json({ error: error.message });
        });
    })
    .catch(error => {
      return res.status(401).json({ error: 'Phone number not found' });
    });
});

// Register
router.post('/register', (req, res) => {
  const { name, phone, password, email, address } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: 'Could not hash password' });
    }
    User.create({
      name: name,
      phone: phone,
      account: {
        password: hashedPassword,
        email: email,
        address: address,
        role: `potential customer`
      }
    }, {
      include: [Account]
    })
      .then(user => {
        Account.findOne({ where: { userId: user.userId } })
          .then(account => {
            const token = jwt.sign(account.accountId, process.env.JWT_SECRET);
            res.status(200).json(token);
          })
          .catch(error => {
            res.status(500).json({ error: error.message });
          });
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });
  });
});

module.exports = router;
