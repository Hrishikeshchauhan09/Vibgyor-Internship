const db = require('./config/db');

async function patch() {
  try {
    console.log('Creating attendance table...');
    await db.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        date DATE NOT NULL,
        check_in DATETIME DEFAULT NULL,
        check_out DATETIME DEFAULT NULL,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        UNIQUE(user_id, date)
      );
    `);
    console.log('Attendance table created successfully!');
  } catch (err) {
    console.error('Failed:', err.message);
  } finally {
    process.exit();
  }
}

patch();
