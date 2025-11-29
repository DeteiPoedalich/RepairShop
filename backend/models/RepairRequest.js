const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  const RepairRequest = sequelize.define('RepairRequest', {
    id_request: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    device_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    device_brand: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    device_model: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    problem_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    contact_email: {
      type: DataTypes.STRING(100)
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'approved', 'rejected']]
      }
    }
  }, {
    tableName: 'repair_requests',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  return RepairRequest;
};