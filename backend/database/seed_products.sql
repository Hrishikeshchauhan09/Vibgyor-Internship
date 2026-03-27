USE ecommerce_db;

INSERT INTO products (category_id, name, description, price, stock, image_url, created_at, status) VALUES

-- Electronics (category_id = 1)
(1, 'Sony WH-1000XM5 Headphones',
 'Industry-leading noise cancelling wireless headphones with 30-hour battery life, multipoint connection, and crystal clear hands-free calling.',
 24990.00, 45, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', NOW(), true),

(1, 'Samsung 65" 4K Smart TV',
 'Crystal UHD 4K display with HDR, built-in voice assistants, and seamless streaming from all major OTT platforms.',
 72990.00, 12, 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400', NOW(), true),

-- Clothing (category_id = 2)
(2, 'Men\'s Classic Slim Fit Shirt',
 'Premium cotton blend slim fit formal shirt, perfect for office and casual outings. Available in multiple colours.',
 1299.00, 120, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400', NOW(), true),

(2, 'Women\'s Floral Kurta Set',
 'Elegant floral printed kurta with matching palazzo pants. Breathable fabric, ideal for festive and daily wear.',
 1799.00, 85, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', NOW(), true),

-- Books (category_id = 3)
(3, 'Atomic Habits by James Clear',
 'The internationally acclaimed guide to building good habits and breaking bad ones. Over 10 million copies sold worldwide.',
 499.00, 200, 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400', NOW(), true),

(3, 'The Lean Startup by Eric Ries',
 'A must-read for entrepreneurs and product managers. Learn how to build, measure, and learn faster than any competitor.',
 549.00, 150, 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400', NOW(), true);
