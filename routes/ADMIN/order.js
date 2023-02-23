require('dotenv').config();

const express = require('express');
const router = express.Router();
const {Order, Voucher, User, Account, LoyaltyProgram, VariantItem,Item, sequelize, OrderItem} = require('../../models/db');

const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page

// GET all by accountId
router.get('/find', async (req, res) => {
    try {
      const account = await Account.findByPk(req.query.accountId);
      const orders = await Order.findAll({
        where: {userId: account.userId} ,
        include:[{
          model:VariantItem,
          through:{
            model: OrderItem,
            attributes: ['quantity'],
          },
          attributes: ['VariantItemId', 'color', 'size', ],
        }],
        attributes: ['orderId', 'orderDate', 'status'],
        
      })
  
      res.status(200).json({
        orders
      });
    } catch (error) {
      res.status(500).json({
        error: error
      });
    }
});

// GET all orders
router.get('/', async (req, res) => {
    try {
      const orders = await Order.findAll({
        include:[{
          model:VariantItem,
          through:{
            model: OrderItem,
            attributes: ['quantity'],
          },
          attributes: ['VariantItemId', 'color', 'size', ],
        }],
        attributes: ['orderId', 'orderDate', 'status'],
        
      })
  
      res.status(200).json({
        orders
      });
    } catch (error) {
      res.status(500).json({
        error: error.message
      });
    }
  });

// order to user offline
router.post('/', async (req, res) => {
  const {phone ,items} = req.body;

  const t = await sequelize.transaction();

  try {

    //Take UserId
    const user = await User.findByPk({where: phone}, {transaction: t});
    if (!user){
        user = await User.create({
            name: 'OFFLINE',
            phone
        });
    }

    // Create the order
    const order = await Order.create({
      userId: user.userId,
      address: 'OFFLINE',
      status: 'delivered',
      orderDate: new Date()
    }, { transaction: t });

    // Create the order items and associate them with the order and update quantity item
    const promises = items.map(async (item) => {
      const { variantItemId, quantity } = item;
      const variantItem = await VariantItem.findByPk(variantItemId);
      if (!variantItem) {
        throw new Error(`Variant item with ID ${variantItemId} not found`);
      }
      order.addVariantItem(variantItem, { through: { quantity }, transaction: t });
      let updateQuantity = variantItem.quantity - quantity;
      await variantItem.update({quantity: updateQuantity}, {transaction: t});
    });
    await Promise.all(promises);

    // caculater totalPrice
    let totalPrice = 0;
    for (const orderItem of items) {
      const { variantItemId, quantity } = orderItem;
      const variantItem = await VariantItem.findByPk(variantItemId, {transaction: t});
      const item = await Item.findByPk(variantItem.itemId, {transaction: t});
      totalPrice += quantity * item.price;
    }

    await t.commit();

    res.status(201).json({ message: 'order successfully' });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;