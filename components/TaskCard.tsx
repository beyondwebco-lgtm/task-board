'use client';

import React, { useState } from 'react';
import { Calendar, Edit3, Trash2 } from 'lucide-react';
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
  const [isDragging, setIsDragging] = useState(false);

  const isCompleted = task.status === 'Completed';

  const handleCheckboxToggle = () => {
    const nextStatus = isCompleted ? 'Pending' : 'Completed';
    onStatusChange(task.id, nextStatus);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const isOverdue = () => {
    if (isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.due_date);
    return due < today;
  };

  // Drag-and-Drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      className={`task-item ${isDragging ? 'dragging' : ''}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="task-main-row">
        {/* Single-Click Checkbox */}
        <input
          type="checkbox"
          className="task-checkbox"
          checked={isCompleted}
          onChange={handleCheckboxToggle}
          title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
        />

        {/* Title & Priority Badge */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            <span className={`task-title ${isCompleted ? 'completed' : ''}`}>
              {task.title}
            </span>
            <span className={`priority-pill ${task.priority || 'Medium'}`}>
              {task.priority || 'Medium'}
            </span>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="task-hover-actions">
          <button
            className="btn-icon-only"
            onClick={() => onEdit(task)}
            title="Edit Task"
            aria-label="Edit Task"
          >
            <Edit3 size={14} />
          </button>
          <button
            className="btn-icon-only danger"
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            aria-label="Delete Task"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Task Bottom Meta */}
      <div className="task-bottom-meta">
        {/* Status Chip Dropdown */}
        <select
          className={`status-chip ${task.status.replace(/\s+/g, '-')}`}
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as any)}
          title="Change task status"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Due Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            color: isOverdue() ? '#dc2626' : 'var(--text-muted)',
            fontWeight: isOverdue() ? '600' : '500',
          }}
          title={`Due: ${task.due_date}`}
        >
          <Calendar size={12} />
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
};
