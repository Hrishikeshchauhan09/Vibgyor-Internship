require('dotenv').config();
const db = require('./config/db');

async function createWishlistTable() {
  try {
    console.log("Setting up Wishlist Table...");
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        wishlist_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        product_id INT NOT NULL,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
        UNIQUE KEY user_product_unique (user_id, product_id)
      )
    `);

    console.log("✅ Wishlist table created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating wishlist table:", err);
    process.exit(1);
  }
}

createWishlistTable();
