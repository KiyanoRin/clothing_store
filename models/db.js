const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('clothingstore', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',
});

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

const User = sequelize.define('user', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: false
  }
});

const Account = sequelize.define('account', {
  accountId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  password: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  address: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('admin', 'loyal customer', 'regular customer', 'potential customer'),
    allowNull: false
  }
},{
  getterMethods: {
    getPhone: function(){
      User.findByPk(this.userId)
        .then(user => {
          return user.phone;
        })
    }
  }
});

Account.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Account, { foreignKey: 'userId' });

const Voucher = sequelize.define('Voucher', {
  voucherId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  discount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  limit: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

const Item = sequelize.define('Item', {
  itemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const VariantItem = sequelize.define('VariantItem', {
  VariantItemId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false
  },size: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Item.hasMany(VariantItem, { foreignKey: 'itemId' });
VariantItem.belongsTo(Item, { foreignKey: 'itemId' });

const Cart = sequelize.define('Cart', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Item.belongsToMany(Account, { through: Cart, foreignKey: 'itemId' });
Account.belongsToMany(Item, { through: Cart, foreignKey: 'accountId' });

const Order = sequelize.define('Order', {
  orderId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM,
    values: ['pending', 'shipped', 'delivered'],
    allowNull: false
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false
  }
},{
  getterMethods: {
    totalPrice: function() {
      return OrderItem.findAll({ where: { orderId: this.orderId } })
        .then(orderItems => {
          let totalPrice = 0;
          orderItems.forEach(orderItem => {
            totalPrice += orderItem.quantity * orderItem.item.price;
          });
          if (this.voucherId){
            Voucher.findByPk(voucherId)
              .then(voucher => {
                totalPrice -= (total * voucher.discount / 100);
              })
          }
          return totalPrice;
        });
    }
  }
});

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Order, { foreignKey: 'userId' });

Order.belongsTo(Voucher, { foreignKey: 'voucherId' });
Voucher.hasOne(Order, { foreignKey: 'voucherId' });

const OrderItem = sequelize.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Order.belongsToMany(Item, { through: OrderItem, foreignKey: 'orderId' });
Item.belongsToMany(Order, { through: OrderItem, foreignKey: 'itemId' });

const LoyaltyProgram = sequelize.define('LoyaltyProgram', {
  points: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

LoyaltyProgram.belongsTo(Account, { foreignKey: 'accountId', unique: true });
Account.hasOne(LoyaltyProgram, { foreignKey: 'accountId' });

Account.afterCreate((account, options) => {
  return LoyaltyProgram.create({ accountId: account.accountId, points: 0 });
});

const discount = 0.001;
Order.afterCreate((order, options) => {
  return LoyaltyProgram.findOne({ where: { accountId: order.accountId } })
    .then(loyaltyProgram => {
      loyaltyProgram.points += Math.round(order.totalPrice * discount);
      return loyaltyProgram.save();
    });
});

/* sequelize.sync()
  .then(() => console.log('Tables created successfully'))
  .catch(err => console.error('Unable to create tables', err)); */


module.exports = {Account, Voucher, User, VariantItem, Item, Cart, Order, OrderItem, LoyaltyProgram, sequelize};
