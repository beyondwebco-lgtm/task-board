'use client';

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Search, Database, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  onOpenCreateModal: () => void;
  onOpenDbModal: () => void;
  dbStatus: { connected: boolean; provider: string };
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onOpenCreateModal,
  onOpenDbModal,
  dbStatus,
  theme,
  onToggleTheme,
}) => {
  const [currentDateStr, setCurrentDateStr] = useState('');

  useEffect(() => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    setCurrentDateStr(now.toLocaleDateString('en-US', options));
  }, []);

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="brand">
          <div className="brand-icon">
            <LayoutGrid size={20} />
          </div>
          <div>
            <h1 className="brand-title">Task Board</h1>
          </div>
          {currentDateStr && (
            <div className="current-date-badge">
              {currentDateStr}
            </div>
          )}
        </div>

        <div className="nav-actions">
          {/* Search Input */}
          <div className="search-box">
            <Search size={15} className="search-icon" />
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

          {/* Dark / Light Mode Toggle Button */}
          <button
            className="btn btn-secondary"
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle Dark Mode"
            style={{ padding: '0.45rem 0.75rem' }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
          </button>

          {/* Database Status Indicator */}
          <button className="db-badge" onClick={onOpenDbModal} title="Click to view database settings">
            <span className="db-dot"></span>
            <Database size={13} />
            <span>{dbStatus.provider}</span>
          </button>

          {/* New Task Button */}
          <button className="btn btn-primary" onClick={onOpenCreateModal}>
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
