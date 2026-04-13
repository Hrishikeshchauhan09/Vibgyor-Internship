const db = require('./config/db');

async function patch() {
  try {
    console.log('Altering database: adding account_status...');
    await db.query("ALTER TABLE users ADD COLUMN account_status ENUM('active', 'terminated') DEFAULT 'active'");
    console.log('Database altered successfully!');
  } catch (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column account_status already exists. Safe to proceed!');
    } else {
      console.error('Failed:', err.message);
    }
  } finally {
    process.exit();
  }
}

patch();
