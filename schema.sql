-- TaskBoard PostgreSQL Database Schema
-- Compatible with Neon Tech and Supabase PostgreSQL

-- Enable UUID extension if supported
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Members Table
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    avatar_color VARCHAR(30) DEFAULT 'blue',
    role VARCHAR(50) DEFAULT 'Team Member',
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

-- Seed Initial Team Members if empty
INSERT INTO members (id, name, email, avatar_color, role) VALUES
('mem-1', 'Neelam Vishwa', 'neelam@taskboard.com', '#2563eb', 'Senior Frontend Engineer'),
('mem-2', 'Rahul', 'rahul@taskboard.com', '#7c3aed', 'Full Stack Developer'),
('mem-3', 'Priya', 'priya@taskboard.com', '#ec4899', 'UI/UX Designer'),
('mem-4', 'Arjun', 'arjun@taskboard.com', '#059669', 'Backend Engineer'),
('mem-5', 'Sneha', 'sneha@taskboard.com', '#d97706', 'Product Manager')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Sample Tasks if empty
INSERT INTO tasks (id, title, description, assigned_to, status, priority, due_date) VALUES
('task-101', 'Design TaskBoard UI Layout', 'Create clean responsive wireframes with white theme and blue accents.', 'mem-3', 'Completed', 'High', CURRENT_DATE + INTERVAL '2 days'),
('task-102', 'Setup PostgreSQL Schema & Migration', 'Configure tables for team members and task assignments with persistent storage.', 'mem-4', 'In Progress', 'High', CURRENT_DATE + INTERVAL '3 days'),
('task-103', 'Implement Dashboard Component', 'Build responsive 5-member card grid with real-time state updates.', 'mem-1', 'In Progress', 'Medium', CURRENT_DATE + INTERVAL '4 days'),
('task-104', 'API Routes for CRUD Operations', 'Create GET, POST, PUT, DELETE REST endpoints for tasks.', 'mem-2', 'Pending', 'Medium', CURRENT_DATE + INTERVAL '5 days'),
('task-105', 'Product Backlog Prioritization', 'Review team member workloads and assign upcoming sprint deliverables.', 'mem-5', 'Pending', 'Low', CURRENT_DATE + INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;
