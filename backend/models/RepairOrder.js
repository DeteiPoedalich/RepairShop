// models/RepairOrder.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RepairOrder = sequelize.define('RepairOrder', {
    id_order: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    date_completed: {
      type: DataTypes.DATE
    },
    problem_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    diagnosis: {
      type: DataTypes.TEXT
    },
    cost_estimate: {
      type: DataTypes.DECIMAL(10, 2)
    },
    final_cost: {
      type: DataTypes.DECIMAL(10, 2)
    },
    warranty_until: {
      type: DataTypes.DATE
    },
    // ОСТАВЬТЕ ТОЛЬКО БАЗОВЫЕ ОПРЕДЕЛЕНИЯ БЕЗ REFERENCES
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    device_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    id_master: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'repair_orders',
    timestamps: false
  });

  return RepairOrder;
};