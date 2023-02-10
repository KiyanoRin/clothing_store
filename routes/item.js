require("dotenv").config();

const express = require('express');
const router = express.Router();
const {Item, VariantItem, Cart, sequelize} = require('../models/db');
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

// GET all items
router.get('/', (req, res) => {
    Item.findAll ()
    .then(items => {
        res.status(200).json({
            message: 'Successfully retrieved all accounts',
            items
          });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

// add item to cart
router.post('/:itemId',verifyToken, (req, res) => {
  const quantity = req.body.quantity;
  Cart.create({
    quantity: quantity,
    accountId: req.accountId,
    variantItemId: req.params.itemId
  })
  .then(cart => {
    res.status(201).json({
      message: 'Successfully add item to cart',
      cart
    });
  })
  .catch(error => {
    res.status(400).json({
      error: error
    });
  }); 
});

//GET by category
router.get('/:category', (req, res) => {
  Item.findAll ({where: {category: req.params.category}})
    .then(items => {
        res.status(200).json({
            message: 'Successfully retrieved all accounts',
            items
          });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

// GET one item
router.get('/:itemId', (req, res) => {
  Item.findAll({
    include: [{
      model: VariantItem,
      where: { itemId: req.params.itemId }
    }]
  })
  .then(items => {
      res.status(200).json({
          message: 'Successfully retrieved all ',
          items
        });
  })
  .catch(error => {
    res.status(500).json({
      error: error
    });
  });
});

// POST a new item
router.post('/', (req, res) => {

    const {name, description, price, image, category, variantitems} = req.body;

    Item.create({
        name: name,
        description: description,
        price: price,
        image: image,
        category: category, 
        VariantItems: variantitems},
        {
        include:[{
            model: VariantItem
        }]
    })
      .then(item => {
        res.status(201).json({
          message: 'Successfully created a new item',
          item
        });
      })
      .catch(error => {
        res.status(400).json({
          error
        });
      }); 
  });

// PUT (update) an existing account
router.put('/', (req, res) => {
  Item.findByPk(req.query.itemId)
    .then(item => {
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      return item.update(req.body)
        .then(() => {
          res.status(200).json({ message: 'Item updated successfully' });
        });
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });

});

// DELETE a specific account
router.delete('/', (req, res) => {
  Item.destroy({ where: { accountId: req.query.itemId } })
    .then(() => {
      res.status(200).json({
        message: `Successfully deleted account with ID ${req.query.itemId}`
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

module.exports = router;
