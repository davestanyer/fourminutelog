-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and dependencies with CASCADE
DROP TABLE IF EXISTS activity_cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS recurring_tasks CASCADE;

-- Create clients table first (since it's referenced by users)
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    color TEXT NOT NULL,
    tag TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    avatar TEXT NOT NULL,
    default_client_id UUID REFERENCES clients(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create activity_cards table
CREATE TABLE activity_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE NOT NULL,
    what_i_did JSONB NOT NULL DEFAULT '[]'::jsonb,
    what_broke TEXT[] NOT NULL DEFAULT '{}',
    how_i_fixed TEXT[] NOT NULL DEFAULT '{}',
    tasks_for_tomorrow TEXT[] NOT NULL DEFAULT '{}',
    admin_time NUMERIC(4,1) NOT NULL DEFAULT 0,
    meeting_time NUMERIC(4,1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create recurring_tasks table
CREATE TABLE recurring_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    task_text TEXT NOT NULL,
    client_id UUID REFERENCES clients(id),
    time_estimate NUMERIC(4,1) DEFAULT 0,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    days_of_week INTEGER[] DEFAULT NULL,
    day_of_month INTEGER DEFAULT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    is_end_of_month BOOLEAN DEFAULT FALSE,
    is_start_of_month BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_activity_cards_user_id ON activity_cards(user_id);
CREATE INDEX idx_activity_cards_date ON activity_cards(date);
CREATE UNIQUE INDEX idx_clients_tag ON clients(tag);
CREATE INDEX idx_recurring_tasks_user_id ON recurring_tasks(user_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

-- Policies for recurring_tasks
CREATE POLICY "Users can view their own recurring tasks"
    ON recurring_tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring tasks"
    ON recurring_tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring tasks"
    ON recurring_tasks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring tasks"
    ON recurring_tasks FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for activity_cards
CREATE POLICY "Users can view all activity cards"
    ON activity_cards FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can insert their own activity cards"
    ON activity_cards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity cards"
    ON activity_cards FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activity cards"
    ON activity_cards FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for users
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policies for clients
CREATE POLICY "Anyone can view clients"
    ON clients FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can create clients"
    ON clients FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Anyone can update clients"
    ON clients FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Anyone can delete clients"
    ON clients FOR DELETE
    TO authenticated
    USING (true);