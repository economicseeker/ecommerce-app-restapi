-- E-commerce Database Schema
-- Created for the e-commerce REST API project

-- Enable UUID extension for better ID management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - Customer accounts
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country VARCHAR(50) DEFAULT 'USA',
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories table - Product categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table - Product catalog
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    sku VARCHAR(100) UNIQUE,
    stock_quantity INTEGER DEFAULT 0,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Carts table - Shopping carts
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'active', -- active, abandoned, converted
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart Items table - Items in shopping cart
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL, -- Price when added to cart
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table - Customer orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT NOT NULL,
    billing_address TEXT NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'pending', -- pending, paid, failed
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items table - Items within orders
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price_at_time DECIMAL(10,2) NOT NULL, -- Price when order was placed
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_carts_user_id ON carts(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
-- Sample categories
INSERT INTO categories (name, description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel and fashion items'),
('Books', 'Books and publications'),
('Home & Garden', 'Home improvement and garden supplies');

-- Sample products
INSERT INTO products (name, description, price, category_id, sku, stock_quantity) VALUES 
('iPhone 15 Pro', 'Latest iPhone with advanced features', 999.99, 1, 'IPHONE15PRO', 50),
('Samsung Galaxy S24', 'Premium Android smartphone', 899.99, 1, 'SAMSUNG-S24', 30),
('Nike Air Max', 'Comfortable running shoes', 129.99, 2, 'NIKE-AIRMAX', 100),
('The Great Gatsby', 'Classic American novel', 12.99, 3, 'BOOK-GATSBY', 200),
('Garden Hose', '50ft heavy-duty garden hose', 29.99, 4, 'GARDEN-HOSE', 75);

-- Sample user (password will be hashed in the application)
INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES 
('john_doe', 'john@example.com', 'hashed_password_here', 'John', 'Doe'),
('jane_smith', 'jane@example.com', 'hashed_password_here', 'Jane', 'Smith');

-- Sample cart
INSERT INTO carts (user_id, status) VALUES (1, 'active');

-- Sample cart items
INSERT INTO cart_items (cart_id, product_id, quantity, price_at_time) VALUES 
(1, 1, 1, 999.99),
(1, 3, 2, 129.99);

-- Sample order
INSERT INTO orders (user_id, order_number, status, total_amount, shipping_address, billing_address) VALUES 
(2, 'ORD-2024-001', 'confirmed', 129.99, '123 Main St, City, State 12345', '123 Main St, City, State 12345');

-- Sample order items
INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES 
(1, 3, 1, 129.99); 