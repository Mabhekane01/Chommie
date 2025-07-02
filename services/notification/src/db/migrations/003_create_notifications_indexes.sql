-- Migration: 003_create_notifications_indexes.sql
-- Description: Create indexes for the notifications table

-- Indexes for efficient querying on the notifications table
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_status ON notifications (user_id, read_status);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC); -- For fetching latest notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_type ON notifications (user_id, type); -- For filtering by type for a user