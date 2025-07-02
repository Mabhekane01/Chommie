-- Migration: 007_create_notification_delivery_logs_table.sql
-- Description: Create table for logging notification delivery attempts

-- Table: notification_delivery_logs (Optional but Recommended for Debugging/Auditing)
-- Logs attempts and status of sending notifications via external channels (email, push, SMS).
CREATE TABLE IF NOT EXISTS notification_delivery_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID, -- Optional: link back to the 'notifications' table if applicable
    user_id UUID NOT NULL,
    channel_type VARCHAR(20) NOT NULL, -- e.g., 'email', 'push', 'sms'
    status VARCHAR(50) NOT NULL,      -- e.g., 'attempted', 'sent', 'failed', 'queued', 'skipped_dnd', 'skipped_preference'
    external_message_id VARCHAR(255), -- ID from external service (e.g., SendGrid, Firebase Cloud Messaging)
    error_message TEXT,               -- If status is 'failed'
    attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);