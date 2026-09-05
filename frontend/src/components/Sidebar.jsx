import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckSquare,
  Building2,
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects & Products', icon: FolderKanban },
  { to: '/teams', label: 'Teams', icon: Users },
  { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/organization', label: 'Organization', icon: Building2 },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const org = user?.organizationId;
  const orgName = typeof org === 'object' ? org?.orgName : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
          className="mobile-backdrop"
        />
      )}

      <aside
        style={{
          width: 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          zIndex: 45,
        }}
        className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}
      >
        {/* Brand */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(79, 70, 229, 0.4)',
            }}
          >
            A
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '-0.02em' }}>
              DevCollab
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Management System
            </div>
          </div>
        </div>

        {/* Organization Status */}
        <div style={{ padding: '0.875rem 1.25rem 0.25rem' }}>
          <div
            style={{
              padding: '0.55rem 0.75rem',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Building2 size={14} color="var(--primary-light)" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {orgName || 'No Organization'}
              </div>
            </div>
            {isAdmin && (
              <span title="Admin" style={{ display: 'flex' }}>
                <ShieldCheck size={13} color="var(--primary-light)" />
              </span>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav
          style={{
            flex: 1,
            padding: '0.875rem 0.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            overflowY: 'auto',
          }}
        >
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--primary-muted)' : 'transparent',
                border: isActive ? '1px solid var(--primary-border)' : '1px solid transparent',
                transition: 'all 0.15s ease',
              })}
            >
              <Icon size={17} />
              <span style={{ flex: 1 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'rgba(11, 17, 32, 0.4)',
          }}
        >
          <div
            onClick={() => {
              navigate('/profile');
              onClose?.();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              marginBottom: '0.5rem',
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-surface-elevated)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Avatar name={user?.name || ''} src={user?.profilePicture} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.name}
              </div>
              <div
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--text-muted)',
                  textTransform: 'capitalize',
                }}
              >
                {user?.role}
              </div>
            </div>
            <ChevronRight size={14} color="var(--text-muted)" />
          </div>

          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              color: '#f87171',
              padding: '0.5rem 0.75rem',
            }}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            left: -260px;
            transition: left 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: var(--shadow-lg);
          }
          .sidebar-open {
            left: 0;
          }
        }
      `}</style>
    </>
  );
}
