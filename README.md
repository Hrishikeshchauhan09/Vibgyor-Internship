# 🛒 ShopVibe — Ecommerce System
**Vibgyor Internship Project**

A full-stack Ecommerce System built with **React.js**, **Node.js/Express**, and **MySQL**.

---

## 📁 Project Structure

```
Vibgyor Internship/
├── frontend/          # React.js (Vite)
└── backend/           # Node.js + Express REST API
    └── database/
        └── schema.sql # MySQL database schema
```

---

## 🗄️ Database Setup

1. Open MySQL and run:
```sql
source path/to/backend/database/schema.sql
```
Or import via MySQL Workbench / phpMyAdmin.

2. Update `backend/.env`:
```env
DB_PASSWORD=your_mysql_password
```

**Default Admin Login:**
- Email: `admin@ecommerce.com`
- Password: `admin123`

---

## ▶️ Running the Project

### Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## 📊 Database Tables

| Table | Description |
|-------|-------------|
| `users` | User accounts (admin/customer) |
| `categories` | Product categories (soft delete via status) |
| `products` | Product catalog with category FK |
| `cart` | User shopping cart items |
| `orders` | Orders placed by users |
| `payment` | Payment records per order |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login & get JWT token |

### Categories (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | All active categories |
| GET | `/api/categories/all` | All categories (admin) |
| POST | `/api/categories` | Create category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Soft delete category |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | All active products |
| GET | `/api/products/:id` | Single product |
| POST | `/api/products` | Create product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Soft delete (admin) |

### Cart
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cart` | User's cart |
| POST | `/api/cart` | Add to cart |
| PUT | `/api/cart/:id` | Update quantity |
| DELETE | `/api/cart/:id` | Remove item |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | User's orders |
| GET | `/api/orders/all` | All orders (admin) |
| POST | `/api/orders` | Place order |
| PUT | `/api/orders/:id/status` | Update status (admin) |

### Payment
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/payment` | Record payment |
| GET | `/api/payment/order/:id` | Get payment by order |

---

## 🔐 Authentication
- JWT-based authentication
- Token stored in `localStorage`
- Admin-only routes protected on both frontend and backend

## 📱 Features
- ✅ Responsive UI (desktop, tablet, mobile)
- ✅ Role-based access (Admin / Customer)
- ✅ Category CRUD with soft delete & product-count warning
- ✅ Product listing with search & category filter
- ✅ Shopping cart with quantity controls
- ✅ Order placement & tracking
- ✅ Payment method selection
- ✅ Dashboard with key stats
