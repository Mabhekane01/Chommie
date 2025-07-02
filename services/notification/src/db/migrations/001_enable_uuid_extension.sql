-- Migration: 001_enable_uuid_extension.sql
-- Description: Enable uuid-ossp extension for generating UUIDs

-- Enable uuid-ossp extension for generating UUIDs if not already enabled
-- You might need superuser privileges to run this.
-- If you use a cloud provider like AWS RDS, GCP Cloud SQL, this might be enabled by default
-- or you can enable it through their console/CLI.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";