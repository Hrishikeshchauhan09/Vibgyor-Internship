# ShopVibe Configuration & API Documentation

ShopVibe is an enterprise-grade full-stack ecommerce application featuring integrated workforce management, role-based access control, and a scalable relational database architecture.

## Architecture & Tech Stack

This repository is structured into a React client and a highly available REST API backend.

- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Cloud Hosting:** Render (Frontend/Backend) & Aiven (MySQL)
- **Authentication:** JSON Web Tokens (JWT)

## Live Deployment

This project is fully deployed to the cloud!
- **Frontend:** [Render Static Site]https://vibgyor-frontend.onrender.com
- **Backend API:** [Render Web Service]https://vibgyor-backend.onrender.com
- **Database:** Aiven Free MySQL

To test the live application as an administrator, use:
- **Email:** `admin@ecommerce.com`
- **Password:** `admin123`

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- MySQL Server (v8.0+)

## Installation & Setup

### 1. Database Initialization

1. Connect to your local MySQL instance.
2. Execute the provided schema file to construct the application models.
   ```bash
   mysql -u root -p < backend/database/schema.sql
   ```
3. A default administrator account is automatically seeded into the users table.
   - **Email:** `admin@ecommerce.com`
   - **Password:** `admin123`

### 2. Backend Environment

Navigate to the `backend` directory, install necessary dependencies, and supply required configuration parameters.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` root explicitely matching your database configuration. If running the cloud database, use your Aiven credentials:
```env
PORT=5000
DB_HOST=mysql-xxxx-aivencloud.com
DB_PORT=25732
DB_USER=avnadmin
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce_db
JWT_SECRET=vibgyor_ecommerce_jwt_secret_2026
```

Boot the Node server process:
```bash
npm run dev
```

### 3. Frontend Environment

Navigate to the `frontend` workspace to load the client dependencies.

```bash
cd frontend
npm install
npm run dev
```

The localized development client will broadcast to `http://localhost:5173`.

## Database Schema Overview

The `ecommerce_db` layout ensures entity integrity supporting retail logistics, workforce coordination, and customer engagement.

- `users`: Core identity management providing `admin`, `employee`, and `customer` privilege escalation.
- `categories` & `products`: Catalog infrastructure containing soft-deletion directives for referential preservation.
- `carts`, `wishlist` & `orders`: Relational mapping of transactional states and preferences tied to authenticated user IDs.
- `shipping`: Real-time logistics tracking and courier assignment records.
- `payments`: Financial history bindings supporting order workflows and refund management.
- `reviews`: Customer product ratings and textual feedback with moderation status.
- `coupons`: Promotional discount codes, expiration rules, and usage tracking limits.
- `leave_requests` & `attendance`: Human Resource sub-system storing temporal check-in limits and Paid Time Off (PTO) resolutions.

## System Features

- **Role-Based Access Control (RBAC):** Middleware-level security enforcement differentiating administrative tasks, staff controls, and general consumer transactions.
- **Advanced Order Fulfillment:** End-to-end logistics tracking, automated flat-rate shipping calculation, and dynamic status updates.
- **Promotional Engine:** Complex coupon creation supporting flat or percentage discounts, timeframe validation, and hard usage limits.
- **Customer Engagement:** Secure product review system featuring Admin moderation (approve/reject/soft-delete) and verified customer feedback.
- **Revenue Management:** Admin dashboards for auditing payment histories and processing direct transaction refunds.
- **Cart Abandonment Tracking:** Administrative visibility into unfinished customer carts to analyze drop-off rates and potential recovery.
- **Workforce Management Toolkit:** Staff-facing shift attendance protocols combined with an HR-approval dashboard for administrative delegates.

## REST API Reference

### Identity & Authentication
- `POST /api/auth/register` - Provision a new user account.
- `POST /api/auth/login` - Authenticate credentials and execute a signed JWT hand-off.

### Catalog Resource Matrix
- `GET /api/categories` - Query active public categories.
- `GET /api/categories/all` - Internal retrieval of entire administrative category matrix.
- `POST /api/categories` - Generate a new category entity.
- `PUT /api/categories/:id` - Patch parameters of an existing category.
- `DELETE /api/categories/:id` - Soft-delete category classification.
- `GET /api/products` - Return formatted products array.
- `GET /api/products/:id` - Target singular product structure.
- `POST /api/products` - Supply newly provisioned product.
- `PUT /api/products/:id` - Patch product specification.
- `DELETE /api/products/:id` - Soft-delete product record.

### Transaction Core (Cart, Orders, Payment)
- `GET /api/cart` - Retrieve context-aware cart state.
- `GET /api/cart/all` - Admin tracking for abandoned carts.
- `POST /api/cart` - Bind product payload to cart instance.
- `PUT /api/cart/:id` - Patch unit counts inside a cart entity.
- `DELETE /api/cart/:id` - Drop object from active cart.
- `GET /api/wishlist` - Retrieve active user wishlist.
- `POST /api/wishlist` - Add a product hash into user wishlist.
- `DELETE /api/wishlist/:id` - Evict product relationship from user wishlist.
- `GET /api/orders` - Return current identity's order sequence.
- `GET /api/orders/all` - Dump entire global order log (Administrative only).
- `POST /api/orders` - Commit transient cart layout into a firm order entity.
- `PUT /api/orders/:id/status` - Advance lifecycle state assigned to order ID.
- `GET /api/payment/all` - Administrative financial audit log.
- `POST /api/payment` - Submit payment confirmation to state machine.
- `PATCH /api/payment/:id/refund` - Process secure payment refunds.

### Logistics & Marketing (Shipping, Reviews, Coupons)
- `GET /api/shipping/all` - Retrieve global shipping ledger.
- `GET /api/shipping/track/:orderId` - Customer-facing courier tracking payload.
- `PUT /api/shipping/:id` - Admin update to shipping status and AWB tracking info.
- `POST /api/reviews/:productId` - Submit customer rating and review.
- `GET /api/reviews/product/:productId` - Retrieve approved reviews for product display.
- `GET /api/reviews/all` - Admin dashboard for review moderation.
- `PUT /api/reviews/:reviewId/status` - Approve or reject pending reviews.
- `POST /api/coupons/apply` - Validate coupon string and calculate discount dynamically.
- `GET /api/coupons` - Admin dashboard for global coupon rule set.
- `POST /api/coupons` - Provision new discount code and usage constraints.
- `PUT /api/coupons/:id/status` - Soft-delete/deactivate promotional codes.

### Internal Resources (Attendance Tracker & Leave Administration)
- `GET /api/leaves` - View pending/resolved PTO requests (Context-aware based on role).
- `POST /api/leaves` - Insert a time-off proposal into DB.
- `PUT /api/leaves/:id/status` - Administrative mutation of PTO request states flag.
- `GET /api/attendance/today` - Query logged-in user check-in temporal flag.
- `POST /api/attendance/toggle` - Fire a temporal check-in or check-out cycle event.
- `GET /api/attendance/all` - Compile and return full systemic daily staff footprint.
