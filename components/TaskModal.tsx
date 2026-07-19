'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { Member, Task } from '@/lib/db';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Omit<Task, 'id'> | Partial<Task>) => void;
  members: Member[];
  initialTask?: Task | null;
  defaultMemberId?: string;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  initialTask,
  defaultMemberId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Completed'>('Pending');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setAssignedTo(initialTask.assigned_to);
      setStatus(initialTask.status);
      setPriority(initialTask.priority || 'Medium');
      setDueDate(initialTask.due_date);
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo(defaultMemberId || (members[0]?.id || ''));
      setStatus('Pending');
      setPriority('Medium');
      // Default due date to 3 days from today
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 3);
      setDueDate(defaultDate.toISOString().split('T')[0]);
    }
  }, [initialTask, defaultMemberId, members, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo || !dueDate) return;

    onSave({
      title: title.trim(),
      description: description.trim(),
      assigned_to: assignedTo,
      status,
      priority,
      due_date: dueDate,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialTask ? 'Edit Task' : 'Create New Task'}</h2>
          <button className="btn-icon-only" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Task Title */}
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Design homepage layout"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Assign Member */}
            <div className="form-group">
              <label className="form-label">Assign To Member *</label>
              <select
                className="form-select"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role || 'Member'})
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Add task context, notes, or subtasks..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Row: Status, Priority, Due Date */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="Pending">⏳ Pending</option>
                  <option value="In Progress">🔄 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{initialTask ? 'Update Task' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
