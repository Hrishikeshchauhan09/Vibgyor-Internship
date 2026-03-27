USE ecommerce_db;

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
