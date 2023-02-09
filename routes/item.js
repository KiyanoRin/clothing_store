const express = require('express');
const router = express.Router();
const {Item, VariantItem} = require('../models/db');

// GET all accounts
router.get('/', (req, res) => {
    Item.findAll({
        include: VariantItem
    })
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

// 

module.exports = router;