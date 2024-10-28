-- Add recurring_tasks table
CREATE TABLE IF NOT EXISTS recurring_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    text TEXT NOT NULL,
    time_estimate NUMERIC(4,1),
    client_id UUID REFERENCES clients(id),
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    days_of_week INTEGER[] DEFAULT NULL, -- For weekly tasks (0-6, where 0 is Sunday)
    day_of_month INTEGER DEFAULT NULL,   -- For monthly tasks (1-31, or -1 for end of month)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add RLS policies for recurring_tasks
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring tasks"
    ON recurring_tasks FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring tasks"
    ON recurring_tasks FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring tasks"
    ON recurring_tasks FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring tasks"
    ON recurring_tasks FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Modify activity_cards to support recurring tasks
ALTER TABLE activity_cards 
DROP COLUMN IF EXISTS what_i_did CASCADE;

ALTER TABLE activity_cards 
ADD COLUMN what_i_did JSONB DEFAULT '[]'::jsonb;