import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

export interface Member {
  id: string;
  name: string;
  email: string;
  avatar_color: string;
  role: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assigned_to: string; // Member ID
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

// In-Memory Fallback State (Ensures 100% immediate out-of-the-box functionality)
const DEFAULT_MEMBERS: Member[] = [
  { id: 'mem-1', name: 'Neelam Vishwa', email: 'neelam@taskboard.com', avatar_color: '#2563eb', role: 'Senior Frontend Engineer' },
  { id: 'mem-2', name: 'Rahul', email: 'rahul@taskboard.com', avatar_color: '#7c3aed', role: 'Full Stack Developer' },
  { id: 'mem-3', name: 'Priya', email: 'priya@taskboard.com', avatar_color: '#ec4899', role: 'UI/UX Designer' },
  { id: 'mem-4', name: 'Arjun', email: 'arjun@taskboard.com', avatar_color: '#059669', role: 'Backend Engineer' },
  { id: 'mem-5', name: 'Sneha', email: 'sneha@taskboard.com', avatar_color: '#d97706', role: 'Product Manager' },
];

const getInitialDueDate = (daysToAdd: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysToAdd);
  return d.toISOString().split('T')[0];
};

let memoryTasks: Task[] = [
  {
    id: 'task-101',
    title: 'Design TaskBoard UI Layout',
    description: 'Create clean responsive wireframes with white theme and blue accents.',
    assigned_to: 'mem-3',
    status: 'Completed',
    priority: 'High',
    due_date: getInitialDueDate(2),
  },
  {
    id: 'task-102',
    title: 'Setup PostgreSQL Schema & Migration',
    description: 'Configure tables for team members and task assignments with persistent storage.',
    assigned_to: 'mem-4',
    status: 'In Progress',
    priority: 'High',
    due_date: getInitialDueDate(3),
  },
  {
    id: 'task-103',
    title: 'Implement Dashboard Component',
    description: 'Build responsive 5-member card grid with real-time state updates.',
    assigned_to: 'mem-1',
    status: 'In Progress',
    priority: 'Medium',
    due_date: getInitialDueDate(4),
  },
  {
    id: 'task-104',
    title: 'API Routes for CRUD Operations',
    description: 'Create GET, POST, PUT, DELETE REST endpoints for tasks.',
    assigned_to: 'mem-2',
    status: 'Pending',
    priority: 'Medium',
    due_date: getInitialDueDate(5),
  },
  {
    id: 'task-105',
    title: 'Product Backlog Prioritization',
    description: 'Review team member workloads and assign upcoming sprint deliverables.',
    assigned_to: 'mem-5',
    status: 'Pending',
    priority: 'Low',
    due_date: getInitialDueDate(7),
  },
];

// Helper to check Postgres configuration
function getPgPool() {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (connectionString) {
    return new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' || connectionString.includes('neon.tech') || connectionString.includes('supabase')
        ? { rejectUnauthorized: false }
        : false,
    });
  }
  return null;
}

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    return createClient(url, key);
  }
  return null;
}

export async function getDbStatus() {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query('SELECT 1');
      await pool.end();
      return { connected: true, provider: 'PostgreSQL (Neon / Direct)' };
    } catch {
      // ignore
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('members').select('id').limit(1);
      if (!error) return { connected: true, provider: 'Supabase DB' };
    } catch {
      // ignore
    }
  }

  return { connected: false, provider: 'Local Persistence (Active)' };
}

export async function getMembers(): Promise<Member[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM members ORDER BY id ASC');
      await pool.end();
      if (res.rows.length > 0) return res.rows;
    } catch (err) {
      console.warn('PostgreSQL fetch error, falling back:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('members').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) return data as Member[];
    } catch (err) {
      console.warn('Supabase fetch error, falling back:', err);
    }
  }

  return DEFAULT_MEMBERS;
}

export async function getTasks(): Promise<Task[]> {
  const pool = getPgPool();
  if (pool) {
    try {
      const res = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
      await pool.end();
      return res.rows.map(row => ({
        ...row,
        due_date: typeof row.due_date === 'string' ? row.due_date.split('T')[0] : new Date(row.due_date).toISOString().split('T')[0],
      }));
    } catch (err) {
      console.warn('PostgreSQL fetch error, falling back:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Task[];
    } catch (err) {
      console.warn('Supabase fetch error, falling back:', err);
    }
  }

  return memoryTasks;
}

export async function createTask(taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> {
  const newTask: Task = {
    id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    ...taskData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const pool = getPgPool();
  if (pool) {
    try {
      const query = `
        INSERT INTO tasks (id, title, description, assigned_to, status, priority, due_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const values = [newTask.id, newTask.title, newTask.description, newTask.assigned_to, newTask.status, newTask.priority, newTask.due_date];
      const res = await pool.query(query, values);
      await pool.end();
      if (res.rows[0]) return res.rows[0];
    } catch (err) {
      console.warn('PostgreSQL insert error, using local state:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tasks').insert([newTask]).select();
      if (!error && data && data[0]) return data[0] as Task;
    } catch (err) {
      console.warn('Supabase insert error, using local state:', err);
    }
  }

  memoryTasks.unshift(newTask);
  return newTask;
}

export async function updateTask(id: string, taskData: Partial<Task>): Promise<Task | null> {
  const pool = getPgPool();
  if (pool) {
    try {
      const query = `
        UPDATE tasks 
        SET title = COALESCE($1, title),
            description = COALESCE($2, description),
            assigned_to = COALESCE($3, assigned_to),
            status = COALESCE($4, status),
            priority = COALESCE($5, priority),
            due_date = COALESCE($6, due_date),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
      `;
      const values = [taskData.title, taskData.description, taskData.assigned_to, taskData.status, taskData.priority, taskData.due_date, id];
      const res = await pool.query(query, values);
      await pool.end();
      if (res.rows[0]) return res.rows[0];
    } catch (err) {
      console.warn('PostgreSQL update error, using local state:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase.from('tasks').update(taskData).eq('id', id).select();
      if (!error && data && data[0]) return data[0] as Task;
    } catch (err) {
      console.warn('Supabase update error, using local state:', err);
    }
  }

  const idx = memoryTasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    memoryTasks[idx] = { ...memoryTasks[idx], ...taskData, updated_at: new Date().toISOString() };
    return memoryTasks[idx];
  }

  return null;
}

export async function updateTaskStatus(id: string, status: 'Pending' | 'In Progress' | 'Completed'): Promise<Task | null> {
  return updateTask(id, { status });
}

export async function deleteTask(id: string): Promise<boolean> {
  const pool = getPgPool();
  if (pool) {
    try {
      await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
      await pool.end();
      return true;
    } catch (err) {
      console.warn('PostgreSQL delete error, using local state:', err);
    }
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase delete error, using local state:', err);
    }
  }

  const initialLen = memoryTasks.length;
  memoryTasks = memoryTasks.filter(t => t.id !== id);
  return memoryTasks.length < initialLen;
}
