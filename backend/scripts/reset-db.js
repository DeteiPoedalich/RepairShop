const { sequelize } = require('../models');
const { User } = require('../models');

const resetDatabase = async () => {
  try {
    console.log('🔄 Сброс базы данных...');
    
    // Опасно! Удаляет все данные
    await sequelize.sync({ force: true });
    
    console.log('✅ База данных сброшена');
    
    // Создаем тестового администратора
    await User.create({
      email: 'admin@repair.ru',
      password_hash: 'password', // будет захэшировано
      role: 'admin',
      name: 'Администратор Системы',
      phone: '+79161234567'
    });
    
    console.log('✅ Тестовый администратор создан');
    console.log('📧 Email: admin@repair.ru');
    console.log('🔑 Пароль: password');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка сброса БД:', error);
    process.exit(1);
  }
};

resetDatabase();