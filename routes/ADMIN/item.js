require('dotenv').config();

const express = require('express');
const router = express.Router();
const {Item, VariantItem, sequelize} = require('../../models/db');

const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page

//GET by category
router.get('/category/:category', (req, res) => {
  const page = req.query.page || 1;
  const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page
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