-- Migration: 004_create_notification_preferences_table.sql  
-- Description: Create table for user notification preferences

-- Table: notification_preferences
-- Allows users to customize notification settings for different types and channels.
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- Foreign key to the user
    notification_type VARCHAR(50) NOT NULL, -- Specific type (e.g., 'like') or broader category (e.g., 'post_interactions')
    channel_type VARCHAR(20) NOT NULL,    -- e.g., 'in_app', 'email', 'push', 'sms'
    enabled BOOLEAN NOT NULL DEFAULT TRUE, -- True if this specific preference is enabled
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Ensure a user has only one preference for a given notification type and channel
    UNIQUE (user_id, notification_type, channel_type)
);