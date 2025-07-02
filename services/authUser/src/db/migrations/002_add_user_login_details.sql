-- User login sessions table
CREATE TABLE IF NOT EXISTS user_logins (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(45) NOT NULL,                    -- Supports IPv6
  user_agent TEXT NOT NULL,
  device VARCHAR(50) NOT NULL,                        -- e.g. 'mobile', 'desktop'
  browser VARCHAR(100) NOT NULL,                      -- e.g. 'Chrome 114.0'
  os VARCHAR(100) NOT NULL,                           -- e.g. 'Windows 10'
  country VARCHAR(100),                               -- Optional (from IP lookup)
  city VARCHAR(100),                                  -- Optional
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  logout_time TIMESTAMP,                              -- NULL = still active
  is_active BOOLEAN DEFAULT TRUE,
  CHECK (device IN ('mobile', 'desktop', 'tablet', 'other')),
  CHECK (login_time IS NULL OR logout_time IS NULL OR logout_time >= login_time)
);