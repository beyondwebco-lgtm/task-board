'use client';

import React from 'react';
import { Plus, CheckCircle2, Clock, AlertCircle, Layers } from 'lucide-react';
import { Member, Task } from '@/lib/db';
import { TaskCard } from './TaskCard';

interface MemberCardProps {
  member: Member;
  tasks: Task[];
  onAddTaskForMember: (memberId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  tasks,
  onAddTaskForMember,
  onEditTask,
  onDeleteTask,
  onStatusChange,
}) => {
  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="member-card">
      {/* Header */}
      <div className="member-card-header">
        <div className="member-info">
          <div className="member-avatar" style={{ backgroundColor: member.avatar_color || '#2563eb' }}>
            {getInitials(member.name)}
          </div>
          <div className="member-details">
            <h3 className="member-name">{member.name}</h3>
            <p className="member-role">{member.role || 'Team Member'}</p>
          </div>
        </div>

        {/* Stats Breakdown Bar */}
        <div className="member-card-stats">
          <span className="stat-badge pending" title="Pending Tasks">
            <AlertCircle size={11} /> {pendingCount}
          </span>
          <span className="stat-badge in-progress" title="In Progress Tasks">
            <Clock size={11} /> {inProgressCount}
          </span>
          <span className="stat-badge completed" title="Completed Tasks">
            <CheckCircle2 size={11} /> {completedCount}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>| Total: <strong>{tasks.length}</strong></span>
        </div>
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <Layers size={28} className="empty-tasks-icon" />
            <p>No assigned tasks</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>

      {/* Footer Add Task Action */}
      <div className="add-task-footer">
        <button
          className="btn-add-task-card"
          onClick={() => onAddTaskForMember(member.id)}
        >
          <Plus size={15} />
          <span>Add Task for {member.name.split(' ')[0]}</span>
        </button>
      </div>
    </div>
  );
};
