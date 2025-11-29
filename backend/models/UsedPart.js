const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UsedPart = sequelize.define('UsedPart', {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'used_parts',
    timestamps: false
  });

  return UsedPart;
};