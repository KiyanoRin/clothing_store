const express = require('express');
const router = express.Router();
const {Item, VariantItem, Cart, sequelize} = require('../models/db');
const {verifyToken} = require('../middleware/verify');

const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page

//GET by category
router.get('/category/:category', (req, res) => {
  const page = req.query.page || 1;
  const offset = (page - 1) * limit;

  Item.findAndCountAll({ 
    where: {category: req.params.category},
    offset, 
    limit 
  })
    .then(result => {
      const items = result.rows;
      const totalItems = result.count;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        items,
        currentPage: page,
        totalPages,
        totalItems
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
  Item.findByPk(req.params.itemId)
  .then(item => {
      res.status(200).json({
          item
        });
  })
  .catch(error => {
    res.status(500).json({
      error: error
    });
  });
});

// add item to cart
router.post('/:itemId', verifyToken, async (req, res) => {
  try {
    const variantItem = await VariantItem.findByPk(req.body.itemId);
    const quantity = req.body.quantity;
    
    if (variantItem.quantity < quantity) {
      return res.status(400).json({
        message: 'Not enough item to add to cart'
      });
    }

    const cart = await Cart.create({
      quantity: quantity,
      accountId: req.accountId,
      variantItemId: req.params.itemId
    });

    res.status(201).json({
      message: 'Successfully add item to cart'
    });
  } catch (error) {
    res.status(400).json({
      error: error
    });
  }
});

// GET all items
router.get('/', (req, res) => {
  const page = req.query.page || 0; // Default to first page if no page number is specified
  const offset = page * limit;

  Item.findAndCountAll({ 
    offset, 
    limit,
    attributes: ['itemId', 'name', 'price', 'image']
  })
    .then(result => {
      const items = result.rows;
      const totalItems = result.count;
      const totalPages = Math.ceil(totalItems / limit);

      res.status(200).json({
        items,
        currentPage: page,
        totalPages,
        totalItems
      });
    })
    .catch(error => {
      res.status(500).json({
        error: error
      });
    });
});

module.exports = router;
