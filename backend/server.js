const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Route imports
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const shippingRoutes = require('./routes/shipping');
const paymentRoutes = require('./routes/payment');
const customerRoutes = require('./routes/customers');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/leaves', require('./routes/leaves'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/wishlist', require('./routes/wishlist'));

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Ecommerce API Server is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
