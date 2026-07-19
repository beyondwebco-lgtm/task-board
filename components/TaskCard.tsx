'use client';

import React from 'react';
import { Calendar, Edit3, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Task } from '@/lib/db';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  // Format due date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isOverdue = () => {
    if (task.status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date);
    return due < today;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 size={13} />;
      case 'In Progress':
        return <Clock size={13} />;
      default:
        return <AlertCircle size={13} />;
    }
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-actions">
          <button
            className="btn-icon-only"
            onClick={() => onEdit(task)}
            title="Edit Task"
            aria-label="Edit Task"
          >
            <Edit3 size={15} />
          </button>
          <button
            className="btn-icon-only danger"
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            aria-label="Delete Task"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        {/* Interactive Status Selector */}
        <select
          className={`status-pill ${task.status.replace(/\s+/g, '-')}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as 'Pending' | 'In Progress' | 'Completed')}
          title="Click to change task status"
        >
          <option value="Pending">⏳ Pending</option>
          <option value="In Progress">🔄 In Progress</option>
          <option value="Completed">✅ Completed</option>
        </select>

        {/* Due Date */}
        <div className={`due-date ${isOverdue() ? 'overdue' : ''}`} title={`Due: ${task.due_date}`}>
          <Calendar size={13} />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
};
