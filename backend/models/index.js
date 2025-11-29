const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config();

// Настройка подключения к БД
const sequelize = new Sequelize(
  process.env.DB_NAME || 'repair_shop',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Импорт моделей
const UserModel = require('./User')(sequelize, DataTypes);
const ClientModel = require('./Client')(sequelize, DataTypes);
const DeviceTypeModel = require('./DeviceType')(sequelize, DataTypes);
const BrandModel = require('./Brand')(sequelize, DataTypes);
const DeviceModel = require('./Device')(sequelize, DataTypes);
const OrderStatusModel = require('./OrderStatus')(sequelize, DataTypes);
const RepairOrderModel = require('./RepairOrder')(sequelize, DataTypes);
const ServiceModel = require('./Service')(sequelize, DataTypes);
const OrderServiceModel = require('./OrderService')(sequelize, DataTypes);
const SparePartModel = require('./SparePart')(sequelize, DataTypes);
const UsedPartModel = require('./UsedPart')(sequelize, DataTypes);
const RepairRequestModel = require('./RepairRequest')(sequelize, DataTypes);

// Определение связей между моделями

// Связи для пользователей
UserModel.hasMany(RepairOrderModel, { 
  foreignKey: 'id_master', 
  as: 'master_orders',
  constraints: false // временно отключаем constraints для тестирования
});
RepairOrderModel.belongsTo(UserModel, { 
  foreignKey: 'id_master', 
  as: 'master',
  constraints: false
});

// Связи для клиентов
ClientModel.hasMany(RepairOrderModel, { 
  foreignKey: 'client_id', // ИЗМЕНИТЕ НА client_id
  constraints: false
});
RepairOrderModel.belongsTo(ClientModel, { 
  foreignKey: 'client_id', // ИЗМЕНИТЕ НА client_id
  constraints: false
});

ClientModel.hasMany(RepairRequestModel, { foreignKey: 'id_client' });
RepairRequestModel.belongsTo(ClientModel, { foreignKey: 'id_client' });

// Связи для устройств
DeviceModel.hasMany(RepairOrderModel, { 
  foreignKey: 'device_id', // ИЗМЕНИТЕ НА device_id
  constraints: false
});
RepairOrderModel.belongsTo(DeviceModel, { 
  foreignKey: 'device_id', // ИЗМЕНИТЕ НА device_id
  constraints: false
});

DeviceTypeModel.hasMany(DeviceModel, { foreignKey: 'id_type' });
DeviceModel.belongsTo(DeviceTypeModel, { foreignKey: 'id_type' });

BrandModel.hasMany(DeviceModel, { foreignKey: 'id_brand' });
DeviceModel.belongsTo(BrandModel, { foreignKey: 'id_brand' });

// Связи для статусов заказов
OrderStatusModel.hasMany(RepairOrderModel, { 
  foreignKey: 'id_status', 
  constraints: false 
});
RepairOrderModel.belongsTo(OrderStatusModel, { 
  foreignKey: 'id_status', 
  constraints: false 
});

// Связи для услуг
RepairOrderModel.belongsToMany(ServiceModel, { 
  through: OrderServiceModel, 
  foreignKey: 'id_order',
  otherKey: 'id_service',
  as: 'services',
  constraints: false
});
ServiceModel.belongsToMany(RepairOrderModel, { 
  through: OrderServiceModel, 
  foreignKey: 'id_service',
  otherKey: 'id_order',
  as: 'orders',
  constraints: false
});

// Связи для запчастей
RepairOrderModel.belongsToMany(SparePartModel, {
  through: UsedPartModel,
  foreignKey: 'id_order',
  otherKey: 'id_part',
  as: 'used_parts',
  constraints: false
});
SparePartModel.belongsToMany(RepairOrderModel, {
  through: UsedPartModel,
  foreignKey: 'id_part',
  otherKey: 'id_order',
  as: 'orders_used',
  constraints: false
});

module.exports = {
  sequelize,
  User: UserModel,
  Client: ClientModel,
  DeviceType: DeviceTypeModel,
  Brand: BrandModel,
  Device: DeviceModel,
  OrderStatus: OrderStatusModel,
  RepairOrder: RepairOrderModel,
  Service: ServiceModel,
  OrderService: OrderServiceModel,
  SparePart: SparePartModel,
  UsedPart: UsedPartModel,
  RepairRequest: RepairRequestModel
};