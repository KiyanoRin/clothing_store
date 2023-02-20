const express = require('express');
const router = express.Router();
const {Order, Voucher, User, Account, LoyaltyProgram, VariantItem,Item, sequelize, OrderItem} = require('../models/db');

// GET all by accountId
router.get('/', async (req, res) => {
  try {
    const account = await Account.findByPk(req.accountId);
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
      error: error.message
    });
  }
});

// order
router.post('/', async (req, res) => {
  const {address, items, voucherId } = req.body;

  const t = await sequelize.transaction();

  try {
    // Find the voucher
    let voucher = null;
    if (voucherId) {
      voucher = await Voucher.findByPk(voucherId);
      if (!voucher) {
        throw new Error('Invalid voucher code');
      }
    }

    //Take UserId
    const account = await Account.findByPk(req.accountId, {transaction: t});

    // Create the order
    const order = await Order.create({
      userId: account.userId,
      address,
      status: 'pending',
      orderDate: new Date(),
      voucherId: voucher ? voucher.voucherId : null
    }, { transaction: t });

    // Create the order items and associate them with the order
    const promises = items.map(async (item) => {
      const { variantItemId, quantity } = item;
      const variantItem = await VariantItem.findByPk(variantItemId);
      if (!variantItem) {
        throw new Error(`Variant item with ID ${variantItemId} not found`);
      }
      order.addVariantItem(variantItem, { through: { quantity }, transaction: t });
      let updateQuantity = variantItem.quantity - quantity;
      variantItem.update({quantity: updateQuantity}, {transaction: t});
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

    // Add points to the associated account's loyalty program
    const loyaltyProgram = await LoyaltyProgram.findOne({where: {accountId: req.accountId}, transaction: t});
    const points = loyaltyProgram.points + Math.round(totalPrice * 0.001);
    await loyaltyProgram.update({points: points}, {transaction: t});

    // Update role based on loyalty program points
    const currentRole = account.role;
    if (points >= 3000 && currentRole !== 'potential customer') {
      await account.update({ role: 'potential customer' }, { transaction: t });
    } else if (points >= 1000 && currentRole === 'loyal customer') {
      await account.update({ role: 'regular customer' }, { transaction: t });
    } 

    await t.commit();

    res.status(201).json({ message: 'order successfully' });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

// get one order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.orderId, {
      attributes: ['orderDate', 'status', 'address']
    });
    res.status(200).json({
      price: order.totalPrice
    });
  } catch (error) {
    res.status(500).json({
      error: error
    });
  }
});

module.exports = router;
