-- Создание базы данных
CREATE DATABASE repair_shop;

-- Таблица пользователей системы
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'master', 'manager')),
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20)
);

-- Таблица клиентов
CREATE TABLE clients (
    id_client SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT
);

-- Таблица типов устройств
CREATE TABLE device_types (
    id_type SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

-- Таблица брендов
CREATE TABLE brands (
    id_brand SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Таблица устройств
CREATE TABLE devices (
    id_device SERIAL PRIMARY KEY,
    id_type INTEGER REFERENCES device_types(id_type),
    id_brand INTEGER REFERENCES brands(id_brand),
    model VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100)
);

-- Таблица статусов заказа
CREATE TABLE order_statuses (
    id_status SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Таблица заказов на ремонт
CREATE TABLE repair_orders (
    id_order SERIAL PRIMARY KEY,
    id_client INTEGER REFERENCES clients(id_client),
    id_device INTEGER REFERENCES devices(id_device),
    id_status INTEGER REFERENCES order_statuses(id_status) DEFAULT 1,
    id_master INTEGER REFERENCES users(id_user),
    date_created DATE DEFAULT CURRENT_DATE,
    date_completed DATE,
    problem_description TEXT NOT NULL,
    diagnosis TEXT,
    cost_estimate DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    warranty_until DATE
);

-- Таблица услуг
CREATE TABLE services (
    id_service SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INTEGER DEFAULT 1
);

-- Таблица связей заказов и услуг
CREATE TABLE order_services (
    id_order INTEGER REFERENCES repair_orders(id_order),
    id_service INTEGER REFERENCES services(id_service),
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    PRIMARY KEY (id_order, id_service)
);

-- Таблица запчастей
CREATE TABLE spare_parts (
    id_part SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    compatible_models TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 0
);

-- Таблица использованных запчастей
CREATE TABLE used_parts (
    id_order INTEGER REFERENCES repair_orders(id_order),
    id_part INTEGER REFERENCES spare_parts(id_part),
    quantity INTEGER NOT NULL,
    PRIMARY KEY (id_order, id_part)
);

-- Начальные данные
INSERT INTO order_statuses (id_status, name, description) VALUES
(1, 'Принят', 'Заказ принят, ожидает диагностики'),
(2, 'Диагностика', 'Устройство на диагностике'),
(3, 'Согласование', 'Ожидает согласования стоимости'),
(4, 'В ремонте', 'Устройство в ремонте'),
(5, 'Готов', 'Ремонт завершен'),
(6, 'Выдан', 'Устройство выдано клиенту'),
(7, 'Отменен', 'Заказ отменен');

INSERT INTO device_types (name, description) VALUES
('Стиральная машина', 'Автоматические и полуавтоматические стиральные машины'),
('Холодильник', 'Однокамерные, двухкамерные, Side-by-Side холодильники'),
('Телевизор', 'LED, OLED, QLED телевизоры'),
('Посудомоечная машина', 'Встраиваемые и отдельно стоящие посудомойки'),
('Микроволновая печь', 'Соло и гриль микроволновки'),
('Кофемашина', 'Автоматические и рожковые кофемашины');

INSERT INTO brands (name) VALUES
('Samsung'), ('LG'), ('Bosch'), ('Indesit'), ('Ariston'), ('Philips'),
('Sony'), ('Panasonic'), ('Whirlpool'), ('Electrolux');

INSERT INTO services (name, description, price, duration_days) VALUES
('Диагностика', 'Полная диагностика устройства', 500.00, 1),
('Чистка системы', 'Чистка внутренних систем устройства', 1500.00, 1),
('Замена двигателя', 'Замена двигателя стиральной машины', 3500.00, 2),
('Замена компрессора', 'Замена компрессора холодильника', 4500.00, 3),
('Ремонт электронной платы', 'Ремонт системной платы', 2500.00, 2),
('Замена дисплея', 'Замена экрана телевизора', 5500.00, 2),
('Прошивка ПО', 'Обновление программного обеспечения', 1200.00, 1);

INSERT INTO users (email, password_hash, role, name, phone) VALUES
('admin@repair.ru', '$2b$10$8J8HqV7sR9V2k6Q8Y5p8B.FY5V5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z', 'admin', 'Иванов А.С.', '+79161234567'),
('master@repair.ru', '$2b$10$8J8HqV7sR9V2k6Q8Y5p8B.FY5V5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z', 'master', 'Петров В.И.', '+79161234568');