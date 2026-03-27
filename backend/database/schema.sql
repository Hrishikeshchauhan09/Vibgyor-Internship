-- ============================================================
-- Ecommerce System — Database Schema
-- Vibgyor Internship Project
-- Database: MySQL
-- ============================================================

CREATE DATABASE IF NOT EXISTS ecommerce_db;
USE ecommerce_db;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  user_id     INT PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'customer') DEFAULT 'customer',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Table: categories (exact schema as per requirements)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  category_id    INT PRIMARY KEY AUTO_INCREMENT,
  category_name  VARCHAR(100) NOT NULL,
  description    VARCHAR(300),
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  status         BOOLEAN DEFAULT TRUE   -- TRUE = active, FALSE = inactive (soft delete)
);

-- ============================================================
-- Table: products
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
  product_id   INT PRIMARY KEY AUTO_INCREMENT,
  category_id  INT,
  name         VARCHAR(200) NOT NULL,
  description  TEXT,
  price        DECIMAL(10, 2) NOT NULL,
  stock        INT DEFAULT 0,
  image_url    VARCHAR(500),
  created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  status       BOOLEAN DEFAULT TRUE,   -- TRUE = active, FALSE = inactive (soft delete)
  FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE SET NULL
);

-- ============================================================
-- Table: cart
-- ============================================================
CREATE TABLE IF NOT EXISTS cart (
  cart_id     INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  added_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ============================================================
-- Table: orders
-- Relationship: One user -> Many orders (one-to-many as required)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  order_id      INT PRIMARY KEY AUTO_INCREMENT,
  user_id       INT NOT NULL,
  total_amount  DECIMAL(10, 2) NOT NULL,
  shipping_address VARCHAR(500),
  status        ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- Table: payment
-- Stores information related to payment done by user for an order
-- ============================================================
CREATE TABLE IF NOT EXISTS payment (
  payment_id  INT PRIMARY KEY AUTO_INCREMENT,
  order_id    INT NOT NULL,
  amount      DECIMAL(10, 2) NOT NULL,
  method      VARCHAR(50) NOT NULL,
  status      ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
  paid_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- ============================================================
-- Table: leave_requests (HR function)
-- ============================================================
CREATE TABLE IF NOT EXISTS leave_requests (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  user_id     INT NOT NULL,
  reason      VARCHAR(300) NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================
-- Seed: Default admin user
-- Password: admin123 (bcrypt hash — change after first login)
-- ============================================================
INSERT IGNORE INTO users (name, email, password, role)
VALUES ('Admin', 'admin@ecommerce.com', '$2b$10$PKQ3fyDb5bzZcCaECWiC2eFr6Mx9siCXNq5fRw.D/V1O.4OnB6QVe', 'admin');

-- ============================================================
-- Seed: Sample categories
-- ============================================================
INSERT IGNORE INTO categories (category_name, description, status) VALUES
  ('Electronics', 'Electronic gadgets and accessories', true),
  ('Clothing', 'Men and women fashion items', true),
  ('Books', 'Educational and recreational books', true);
