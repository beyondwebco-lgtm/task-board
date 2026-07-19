'use client';

import React, { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { Member, Task } from '@/lib/db';
import { TaskCard } from './TaskCard';

interface MemberCardProps {
  member: Member;
  tasks: Task[];
  onAddTaskForMember: (memberId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => void;
  onTaskDrop: (taskId: string, targetMemberId: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  tasks,
  onAddTaskForMember,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onTaskDrop,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const pendingCount = tasks.filter((t) => t.status === 'Pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const totalTasks = tasks.length;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Drag and drop event listeners
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onTaskDrop(taskId, member.id);
    }
  };

  return (
    <div
      className={`member-card ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Member Header */}
      <div className="member-card-header">
        <div className="member-info">
          <div className="member-avatar" style={{ backgroundColor: member.avatar_color || '#2563eb' }}>
            {getInitials(member.name)}
          </div>
          <div>
            <h3 className="member-name">{member.name}</h3>
            <p className="member-task-count">
              {totalTasks === 1 ? '1 active task' : `${totalTasks} active tasks`}
            </p>
          </div>
        </div>

        {/* Progress Bar Indicator */}
        {totalTasks > 0 && (
          <div className="progress-bar-container" title={`${completedCount} Completed, ${inProgressCount} In Progress, ${pendingCount} Pending`}>
            <div
              className="progress-segment completed"
              style={{ width: `${(completedCount / totalTasks) * 100}%` }}
            />
            <div
              className="progress-segment in-progress"
              style={{ width: `${(inProgressCount / totalTasks) * 100}%` }}
            />
            <div
              className="progress-segment pending"
              style={{ width: `${(pendingCount / totalTasks) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="task-list">
        {tasks.length === 0 ? (
          <div className="empty-tasks">
            <Layers size={24} style={{ marginBottom: '0.4rem', opacity: 0.4 }} />
            <p>No tasks assigned</p>
          </div>
        ) : (
          [...tasks]
            .sort((a, b) => {
              if (a.status === 'Completed' && b.status !== 'Completed') return 1;
              if (a.status !== 'Completed' && b.status === 'Completed') return -1;
              return 0;
            })
            .map((task) => (
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

      {/* Add Task Action */}
      <div className="add-task-footer">
        <button
          className="btn-add-task-card"
          onClick={() => onAddTaskForMember(member.id)}
        >
          <Plus size={14} />
          <span>Add Task</span>
        </button>
      </div>
    </div>
  );
};
