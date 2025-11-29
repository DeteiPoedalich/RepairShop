const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DeviceType = sequelize.define('DeviceType', {
    id_type: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    }
  }, {
    tableName: 'device_types',
    timestamps: false
  });

  return DeviceType;
};