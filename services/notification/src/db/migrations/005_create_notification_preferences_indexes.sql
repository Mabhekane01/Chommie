-- Migration: 005_create_notification_preferences_indexes.sql
-- Description: Create indexes for the notification_preferences table

-- Indexes for efficient querying on the notification_preferences table
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences (user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type_channel ON notification_preferences (notification_type, channel_type);