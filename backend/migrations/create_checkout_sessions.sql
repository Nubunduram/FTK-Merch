CREATE TABLE IF NOT EXISTS checkout_sessions (
  id                SERIAL PRIMARY KEY,
  stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items             JSONB NOT NULL,
  address           JSONB NOT NULL,
  created_at        TIMESTAMP DEFAULT NOW()
);
