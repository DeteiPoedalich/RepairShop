const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderStatus = sequelize.define('OrderStatus', {
    id_status: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'order_statuses',
    timestamps: false
  });

  return OrderStatus;
};