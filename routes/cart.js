const express = require('express');
const router = express.Router();
const {Cart, VariantItem, Item} = require('../models/db');


// GET by accounts
router.get('/', async (req, res) => {
  try {
    const carts = await Cart.findAll({
      where: { accountId: res.locals.decoded.accountId }
    });

    const cartItems = await Promise.all(
      carts.map(async cart => {
        const { quantity, variantItemId } = cart;
        const variantItem = await VariantItem.findByPk(variantItemId);
        const item = await Item.findByPk(variantItem.itemId);
    
        
        return {
          itemId: item.itemId,
          quantity,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          color: variantItem.color,
          size: variantItem.size
        };
      })
    );
    res.status(200).json({
      cartItems
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

//clear items in cart for accountId
router.delete('/', async (req, res) => {
  try {
    // Delete all carts for the account
    await Cart.destroy({
      where: { accountId: res.locals.decoded.accountId }
    });

    res.status(200).json({
      message: 'All items have been removed from the cart.'
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});



module.exports = router;