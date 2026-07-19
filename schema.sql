-- TaskBoard PostgreSQL Database Schema
-- Compatible with Neon Tech and Supabase PostgreSQL

-- Create Members Table
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    avatar_color VARCHAR(30) DEFAULT '#2563eb',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assigned_to VARCHAR(50) REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'In Progress', 'Completed')),
    priority VARCHAR(20) DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    due_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Team Members
INSERT INTO members (id, name, email, avatar_color) VALUES
('mem-1', 'Arun', 'arun@taskboard.com', '#2563eb'),
('mem-2', 'Vishwa', 'vishwa@taskboard.com', '#7c3aed'),
('mem-3', 'Manish', 'manish@taskboard.com', '#ec4899'),
('mem-4', 'Tata', 'tata@taskboard.com', '#059669'),
('mem-5', 'Pavan', 'pavan@taskboard.com', '#d97706')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Seed Initial Tasks
INSERT INTO tasks (id, title, description, assigned_to, status, priority, due_date) VALUES
('task-101', 'Design minimal dashboard wireframes', 'Focus on ultra-clean white layout and high contrast.', 'mem-2', 'Completed', 'High', CURRENT_DATE + INTERVAL '2 days'),
('task-102', 'Configure PostgreSQL schema & connection', 'Connect Neon database with persistent storage.', 'mem-4', 'In Progress', 'High', CURRENT_DATE + INTERVAL '3 days'),
('task-103', 'Build drag-and-drop task re-assignment', 'Allow dragging task cards across member columns.', 'mem-1', 'In Progress', 'Medium', CURRENT_DATE + INTERVAL '4 days'),
('task-104', 'Implement single-click task completion', 'Checkbox toggle for fast task completion.', 'mem-3', 'Pending', 'Medium', CURRENT_DATE + INTERVAL '5 days'),
('task-105', 'Review workload distribution', 'Ensure balanced task allocation across team members.', 'mem-5', 'Pending', 'Low', CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;
