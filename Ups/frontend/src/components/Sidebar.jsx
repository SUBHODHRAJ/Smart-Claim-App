import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sidebar Component
 * Contextual sidebar navigation based on authenticated role
 */
export const Sidebar = () => {
  const { role } = useAuth();

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
        <small style={{ textTransform: 'uppercase', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>
          {role === 'agent' ? 'Agent Workspace' : 'Customer Workspace'}
        </small>
      </div>

      {role === 'agent' ? (
        <>
          <NavLink
            to="/agent/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            📋 Claims Queue
          </NavLink>
        </>
      ) : (
        <>
          <NavLink
            to="/customer/dashboard"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            📦 My Claims
          </NavLink>
          <NavLink
            to="/customer/create-claim"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            ➕ File New Claim
          </NavLink>
        </>
      )}
    </aside>
  );
};

export default Sidebar;
