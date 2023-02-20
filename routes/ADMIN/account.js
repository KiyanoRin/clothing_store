require('dotenv').config();

const express = require('express');
const router = express.Router();
const {Account, User, LoyaltyProgram} = require('../../models/db');

const limit = parseInt(process.env.LIMIT_PAGE); // Number of items to display per page

// GET a single account by ID
router.get('/:accountId', async (req, res) => {
    try {
        const account = await Account.findByPk(req.params.accountId, {
            include: User,
            as: 'user'
        });
        const loyaltyProgram = await LoyaltyProgram.findOne({where: {accountId: req.params.accountId}});

        res.status(200).json({
            accountId: req.params.accountId,
            name: account.user.name,
            phone: account.user.phone,
            role: account.role,
            address: account.address,
            loyaltyPoints: loyaltyProgram.points
        });  
    } catch (error) {
        res.status(500).json({
        error: error.message
        });
    }
});

// GET all accounts
router.get('/', async (req, res) => {
    try {
        const page = req.query.page || 0; // Default to first page if no page number is specified
        const offset = page * limit;

        const result = await Account.findAndCountAll({
            include: [
                { model: User, as: 'user' }
            ],
            distinct: true,
            offset, 
            limit
        });

        const totalAccounts = result.count;
        const totalPages = Math.ceil(totalAccounts / limit);
        
        const accounts = await Promise.all(result.rows.map(async account => {
            const loyaltyProgram = await LoyaltyProgram.findOne({ where: { accountId: account.accountId } });
      
            return {
              accountId: account.accountId,
              name: account.user.name,
              phone: account.user.phone,
              role: account.role,
              address: account.address,
              loyaltyPoints: loyaltyProgram.points
            };
        }));
            
        res.status(200).json({
            accounts,
            currentPage: page,
            totalPages,
            totalAccounts
        });
    } catch (error) {
        res.status(500).json({
        error: error.message
        });
    }
});

// DELETE a specific account
router.delete('/', (req, res) => {
    Account.destroy({ where: { accountId: req.query.accountId } })
      .then(() => {
        res.status(200).json({
          message: `Successfully deleted account with ID ${req.query.accountId}`
        });
      })
      .catch(error => {
        res.status(500).json({
          error: error
        });
      });
  });

module.exports = router;