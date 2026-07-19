'use client';

import React from 'react';
import { LayoutGrid, Plus, Search, Database } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  onOpenCreateModal: () => void;
  onOpenDbModal: () => void;
  dbStatus: { connected: boolean; provider: string };
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onOpenCreateModal,
  onOpenDbModal,
  dbStatus,
}) => {
  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="brand">
          <div className="brand-icon">
            <LayoutGrid size={22} />
          </div>
          <div>
            <h1 className="brand-title">TaskBoard</h1>
            <p className="brand-subtitle">Team Task Management & Assignment</p>
          </div>
        </div>

        <div className="nav-actions">
          {/* Search Bar */}
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            className="select-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* DB Status Badge */}
          <button className="db-badge" onClick={onOpenDbModal} title="Click to view database settings">
            <span className="db-dot"></span>
            <Database size={13} />
            <span>{dbStatus.provider}</span>
          </button>

          {/* New Task Button */}
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
