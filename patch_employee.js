const db = require('./backend/config/db');

async function patch() {
  try {
    console.log('Altering database...');
    await db.query("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'employee', 'customer') DEFAULT 'customer'");
    console.log('Database altered successfully!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    process.exit();
  }
}

patch();
