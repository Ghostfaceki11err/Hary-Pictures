-- Create contact_messages table for storing contact form submissions
-- Run this in your Supabase SQL editor if the table doesn't exist

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contactType TEXT NOT NULL CHECK (contactType IN ('email', 'telegram')),
  email TEXT,
  telegram TEXT,
  phone TEXT,
  service TEXT,
  date TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  csrf_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_submitted_at ON contact_messages(submitted_at);
CREATE INDEX IF NOT EXISTS idx_contact_messages_contact_type ON contact_messages(contactType);
CREATE INDEX IF NOT EXISTS idx_contact_messages_name ON contact_messages(name);

-- Add comments for documentation
COMMENT ON TABLE contact_messages IS 'Stores contact form submissions from the website';
COMMENT ON COLUMN contact_messages.contactType IS 'Type of contact method: email or telegram';
COMMENT ON COLUMN contact_messages.email IS 'Email address (filled when contactType is email)';
COMMENT ON COLUMN contact_messages.telegram IS 'Telegram username (filled when contactType is telegram)';
COMMENT ON COLUMN contact_messages.phone IS 'Phone number (optional)';
COMMENT ON COLUMN contact_messages.service IS 'Requested service type (optional)';
COMMENT ON COLUMN contact_messages.date IS 'Preferred date (optional)';
COMMENT ON COLUMN contact_messages.message IS 'Main message content';
COMMENT ON COLUMN contact_messages.submitted_at IS 'When the form was submitted';
COMMENT ON COLUMN contact_messages.ip_address IS 'IP address of the submitter';
COMMENT ON COLUMN contact_messages.user_agent IS 'Browser user agent string';
COMMENT ON COLUMN contact_messages.csrf_token IS 'CSRF protection token';
