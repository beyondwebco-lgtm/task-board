'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Member, Task } from '@/lib/db';
import { Navbar } from '@/components/Navbar';
import { MemberCard } from '@/components/MemberCard';
import { TaskModal } from '@/components/TaskModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { DbConfigModal } from '@/components/DbConfigModal';
import { CheckCircle2, Clock, AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ connected: false, provider: 'Local Persistence (Active)' });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultMemberId, setDefaultMemberId] = useState<string>('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

  // Initialize theme from LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('taskboard_theme') as 'light' | 'dark') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskboard_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    }
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, tasksRes, dbRes] = await Promise.all([
        fetch('/api/members').then((r) => r.json()),
        fetch('/api/tasks').then((r) => r.json()),
        fetch('/api/db-status').then((r) => r.json()),
      ]);

      if (membersRes.success) setMembers(membersRes.data);
      if (dbRes.success) setDbStatus(dbRes.data);

      const savedLocalTasks = typeof window !== 'undefined' ? localStorage.getItem('taskboard_tasks') : null;
      if (savedLocalTasks && !dbRes.data?.connected) {
        try {
          setTasks(JSON.parse(savedLocalTasks));
        } catch {
          if (tasksRes.success) setTasks(tasksRes.data);
        }
      } else if (tasksRes.success) {
        setTasks(tasksRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !dbStatus.connected && typeof window !== 'undefined') {
      localStorage.setItem('taskboard_tasks', JSON.stringify(tasks));
    }
  }, [tasks, dbStatus.connected, loading]);

  useEffect(() => {
    fetchData();
  }, []);

  // Open Create Task Modal
  const handleOpenCreateModal = (memberId?: string) => {
    setEditingTask(null);
    setDefaultMemberId(memberId || (members[0]?.id || ''));
    setIsTaskModalOpen(true);
  };

  // Open Edit Task Modal
  const handleOpenEditModal = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Save Task (Create or Update)
  const handleSaveTask = async (taskData: Omit<Task, 'id'> | Partial<Task>) => {
    if (editingTask) {
      const updatedList = tasks.map((t) =>
        t.id === editingTask.id ? ({ ...t, ...taskData } as Task) : t
      );
      setTasks(updatedList);

      try {
        await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        });
      } catch (err) {
        console.error('Failed to update task:', err);
      }
    } else {
      const tempId = `temp-${Date.now()}`;
      const tempTask: Task = {
        id: tempId,
        ...(taskData as Omit<Task, 'id'>),
      };
      setTasks((prev) => [tempTask, ...prev]);

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        }).then((r) => r.json());

        if (res.success && res.data) {
          setTasks((prev) => prev.map((t) => (t.id === tempId ? res.data : t)));
        }
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    }
  };

  // Quick Status Change
  const handleStatusChange = async (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.error('Failed to change task status:', err);
    }
  };

  // Drag and drop task re-assignment handler
  const handleTaskDrop = async (taskId: string, targetMemberId: string) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask || targetTask.assigned_to === targetMemberId) return;

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, assigned_to: targetMemberId } : t))
    );

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigned_to: targetMemberId }),
      });
    } catch (err) {
      console.error('Failed to reassign task:', err);
    }
  };

  // Delete handlers
  const handleOpenDeleteModal = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    const targetId = deletingTaskId;
    setTasks((prev) => prev.filter((t) => t.id !== targetId));

    try {
      await fetch(`/api/tasks/${targetId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Filter tasks based on status & search
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [tasks, statusFilter, searchQuery]);

  // Overall Statistics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const activeTaskForDelete = tasks.find((t) => t.id === deletingTaskId);

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onOpenCreateModal={() => handleOpenCreateModal()}
        onOpenDbModal={() => setIsDbModalOpen(true)}
        dbStatus={dbStatus}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <main className="dashboard-main">
        {/* Header Stats Overview */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1>Team Dashboard</h1>
          </div>

          <div className="stats-summary">
            <div className="stat-pill">
              <span>Total Tasks</span>
              <span className="count">{totalCount}</span>
            </div>
            <div className="stat-pill">
              <AlertCircle size={14} style={{ color: 'var(--pending-text)' }} />
              <span>Pending</span>
              <span className="count" style={{ color: 'var(--pending-text)' }}>{pendingCount}</span>
            </div>
            <div className="stat-pill">
              <Clock size={14} style={{ color: 'var(--in-progress-text)' }} />
              <span>In Progress</span>
              <span className="count" style={{ color: 'var(--in-progress-text)' }}>{inProgressCount}</span>
            </div>
            <div className="stat-pill">
              <CheckCircle2 size={14} style={{ color: 'var(--completed-text)' }} />
              <span>Completed</span>
              <span className="count" style={{ color: 'var(--completed-text)' }}>{completedCount}</span>
            </div>
          </div>
        </div>

        {/* 5 Column Grid Layout */}
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', gap: '0.75rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={22} className="animate-spin" />
            <span>Loading Task Board...</span>
          </div>
        ) : (
          <div className="members-grid">
            {members.map((member) => {
              const memberTasks = filteredTasks.filter((t) => t.assigned_to === member.id);
              return (
                <MemberCard
                  key={member.id}
                  member={member}
                  tasks={memberTasks}
                  onAddTaskForMember={handleOpenCreateModal}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={handleOpenDeleteModal}
                  onStatusChange={handleStatusChange}
                  onTaskDrop={handleTaskDrop}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Task Creation & Editing Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={handleSaveTask}
        members={members}
        initialTask={editingTask}
        defaultMemberId={defaultMemberId}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        taskTitle={activeTaskForDelete?.title}
      />

      {/* DB Setup & Status Modal */}
      <DbConfigModal
        isOpen={isDbModalOpen}
        onClose={() => setIsDbModalOpen(false)}
        dbStatus={dbStatus}
      />
    </>
  );
}
