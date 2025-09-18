-- Add parent/child account structure
ALTER TABLE users ADD COLUMN role TEXT CHECK(role IN ('parent', 'child')) NOT NULL DEFAULT 'child';
ALTER TABLE users ADD COLUMN parent_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_users_parent_id ON users(parent_id);
