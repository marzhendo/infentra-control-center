-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: divisions
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    target_progress FLOAT DEFAULT 0.0
);

-- Table: tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    division_id UUID NOT NULL REFERENCES divisions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    pic TEXT NOT NULL,
    deadline DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Not Started', 'In Progress', 'Waiting Review', 'Done', 'Overdue')),
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    link_attachment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: timeline_events
CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_name TEXT NOT NULL,
    date DATE NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Milestone', 'Oprec', 'Event Day', 'Internal')),
    description TEXT
);

-- Row Level Security
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (development)
CREATE POLICY "Enable public read and write access for divisions" ON divisions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable public read and write access for tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable public read and write access for timeline_events" ON timeline_events FOR ALL USING (true) WITH CHECK (true);
