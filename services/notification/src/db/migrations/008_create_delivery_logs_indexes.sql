-- Migration: 008_create_delivery_logs_indexes.sql
-- Description: Create indexes for the notification_delivery_logs table

-- Indexes for delivery logs
CREATE INDEX IF NOT EXISTS idx_delivery_logs_user_id ON notification_delivery_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_notification_id ON notification_delivery_logs (notification_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_status_attempted_at ON notification_delivery_logs (status, attempted_at DESC);