-- Migration: 006_create_user_notification_settings_table.sql
-- Description: Create table for general user notification settings

-- Table: user_notification_settings
-- Stores general, non-type-specific notification settings for a user.
CREATE TABLE IF NOT EXISTS user_notification_settings (
    user_id UUID PRIMARY KEY, -- Primary key, also a foreign key to the users table
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    sms_enabled BOOLEAN NOT NULL DEFAULT FALSE, -- Assuming SMS might be disabled by default
    dnd_start_time TIME, -- Do Not Disturb start time (e.g., '22:00:00')
    dnd_end_time TIME,   -- Do Not Disturb end time (e.g., '07:00:00')
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);