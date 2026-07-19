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

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultMemberId, setDefaultMemberId] = useState<string>('');

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const [isDbModalOpen, setIsDbModalOpen] = useState(false);

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

      // Check if local storage has custom tasks saved (for offline / local fallback mode)
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

  // Sync state to local storage when in fallback mode
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
      // Optimistic update
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
      // Optimistic Add
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
          // Replace temp task with real saved task from DB
          setTasks((prev) => prev.map((t) => (t.id === tempId ? res.data : t)));
        }
      } catch (err) {
        console.error('Failed to create task:', err);
      }
    }
  };

  // Status Change directly from card
  const handleStatusChange = async (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    // Optimistic status change
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

  // Open Delete Confirmation
  const handleOpenDeleteModal = (taskId: string) => {
    setDeletingTaskId(taskId);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTaskId) return;
    const targetId = deletingTaskId;

    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== targetId));

    try {
      await fetch(`/api/tasks/${targetId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Filter tasks based on search & status dropdown
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
      />

      <main className="dashboard-main">
        {/* Dashboard Header Banner */}
        <div className="dashboard-header">
          <div className="dashboard-title-group">
            <h1>Team Dashboard</h1>
            <p>Real-time task distribution across team members</p>
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
            <RefreshCw size={24} className="animate-spin" />
            <span>Loading TaskBoard...</span>
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
