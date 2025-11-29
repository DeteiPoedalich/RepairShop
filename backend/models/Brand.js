const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Brand = sequelize.define('Brand', {
    id_brand: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'brands',
    timestamps: false
  });

  return Brand;
};