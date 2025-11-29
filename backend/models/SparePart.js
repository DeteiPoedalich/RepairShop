const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SparePart = sequelize.define('SparePart', {
    id_part: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    compatible_models: {
      type: DataTypes.TEXT
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'spare_parts',
    timestamps: false
  });

  return SparePart;
};