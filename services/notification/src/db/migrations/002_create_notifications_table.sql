-- Migration: 002_create_notifications_table.sql
-- Description: Create the main notifications table

-- Table: notifications
-- Stores individual notification messages for users.
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- The user who receives this notification. Assumes a 'users' table exists elsewhere.
    sender_id UUID,        -- The user who triggered this notification (nullable for system/integration notifications).
                           -- Assumes a 'users' table exists elsewhere.
    type VARCHAR(50) NOT NULL, -- e.g., 'like', 'comment', 'follow', 'message', 'friend_request',
                               -- 'new_post', 'playlist_update', 'movie_release', 'system_alert'
    message TEXT NOT NULL,     -- The display text of the notification
    read_status BOOLEAN NOT NULL DEFAULT FALSE, -- True if the user has read the notification
    action_link VARCHAR(255),  -- Optional: URL or path for user to navigate to (e.g., /posts/123)
    metadata JSONB,            -- Flexible JSON storage for type-specific data (e.g., { "postId": "...", "commentId": "..." })
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);