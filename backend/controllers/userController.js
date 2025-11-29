const { User } = require('../models');
const { validationResult } = require('express-validator');

exports.getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password_hash'] },
      order: [['name', 'ASC']]
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ошибка при загрузке пользователей' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
};

exports.createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role, name, phone } = req.body;

    // Проверяем, существует ли пользователь с таким email
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const user = await User.create({
      email,
      password_hash: password, // хэшируется в хуке модели
      role,
      name,
      phone
    });

    // Не возвращаем пароль
    const userResponse = await User.findByPk(user.id_user, {
      attributes: { exclude: ['password_hash'] }
    });

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Ошибка при создании пользователя' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { email, password, role, name, phone } = req.body;

    // Проверяем, не занят ли email другим пользователем
    if (email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }
    }

    const updateData = {
      email,
      role,
      name,
      phone
    };

    // Обновляем пароль только если он предоставлен
    if (password) {
      updateData.password_hash = password;
    }

    await user.update(updateData);

    const updatedUser = await User.findByPk(user.id_user, {
      attributes: { exclude: ['password_hash'] }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Ошибка при обновлении пользователя' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Нельзя удалить самого себя
    if (parseInt(req.params.id) === req.user.id_user) {
      return res.status(400).json({ error: 'Нельзя удалить собственный аккаунт' });
    }

    await user.destroy();

    res.json({ message: 'Пользователь успешно удален' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Ошибка при удалении пользователя' });
  }
};