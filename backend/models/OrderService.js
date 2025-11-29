const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderService = sequelize.define('OrderService', {
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    price: {
      type: DataTypes.DECIMAL(10, 2)
    }
  }, {
    tableName: 'order_services',
    timestamps: false
  });

  return OrderService;
};