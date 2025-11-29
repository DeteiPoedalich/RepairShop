const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Device = sequelize.define('Device', {
    id_device: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    serial_number: {
      type: DataTypes.STRING(100)
    }
  }, {
    tableName: 'devices',
    timestamps: false
  });

  return Device;
};