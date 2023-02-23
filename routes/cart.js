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

// delete item to cart
/* req có dạng như sau 
{
  "items": [
      {
          "itemId": "1",
          "size": "L"
      },
      {
          "itemId":"1",
          "size":"M"
      },
      {
          "itemId":"3",
          "size":"M"
      }
  ]
} */
router.delete("/", async (req, res) => {
  const { items } = req.body;
  try {
    const promises = items.map(async item => {
      const variantItem = await VariantItem.findOne({
        where: {
          itemId: item.itemId,
          size: item.size
        }
      });

      await Cart.destroy({
        where: {
          accountId: res.locals.decoded.accountId,
          VariantItemId: variantItem.VariantItemId
        }
      });
    });

    await Promise.all(promises);

    res.status(201).json({
      message: "Successfully delete item to cart",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});


module.exports = router;