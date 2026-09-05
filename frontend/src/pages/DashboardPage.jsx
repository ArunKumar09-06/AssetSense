import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Users,
  CheckSquare,
  Building2,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectApi, teamApi, taskApi } from '../api';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function DashboardPage() {
  const { user, isAdmin, hasOrg } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasOrg) {
      setLoading(false);
      return;
    }

    const loadDashboardData = async () => {
      try {
        const [projRes, teamRes, taskRes] = await Promise.allSettled([
          projectApi.getAll(),
          teamApi.getAll(),
          taskApi.getMyTasks(),
        ]);

        if (projRes.status === 'fulfilled') setProjects(projRes.value.data.data || []);
        if (teamRes.status === 'fulfilled') setTeams(teamRes.value.data.data || []);
        if (taskRes.status === 'fulfilled') setMyTasks(taskRes.value.data.data || []);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [hasOrg]);

  if (loading) {
    return <LoadingSpinner text="Loading workspace overview..." />;
  }

  // If user has not created or joined an organization yet
  if (!hasOrg) {
    return (
      <div>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome to AssetSense, {user?.name}!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            To begin organizing projects, teams, and tasks, create your organization workspace.
          </p>
        </div>

        <EmptyState
          icon={Building2}
          title="No Organization Found"
          description="Every project, team, and task lives inside an organization. Set up your workspace to get started."
          action={
            <Link to="/organization" className="btn btn-primary">
              <Plus size={16} /> Create Organization
            </Link>
          }
        />
      </div>
    );
  }

  const activeProjects = projects.filter((p) => p.status === 'Active');
  const completedProjects = projects.filter((p) => p.status === 'Completed');
  const completedTasks = myTasks.filter((t) => t.status === 'Completed');
  const pendingTasks = myTasks.filter((t) => t.status !== 'Completed');

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Overview for {user?.organizationId?.orgName || 'Workspace'}
          </p>
        </div>

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/teams" className="btn btn-secondary btn-sm">
              <Users size={15} /> Teams
            </Link>
            <Link to="/projects" className="btn btn-primary btn-sm">
              <Plus size={15} /> New Project
            </Link>
          </div>
        )}
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Projects</span>
            <FolderKanban size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            {projects.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {activeProjects.length} active · {completedProjects.length} completed
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>Teams</span>
            <Users size={18} color="var(--info)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            {teams.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Configured in organization
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>My Tasks</span>
            <CheckSquare size={18} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            {myTasks.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {pendingTasks.length} pending · {completedTasks.length} done
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, textTransform: 'uppercase' }}>Completion</span>
            <TrendingUp size={18} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            {myTasks.length > 0
              ? `${Math.round((completedTasks.length / myTasks.length) * 100)}%`
              : '100%'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
            Personal task velocity
          </div>
        </div>
      </div>

      {/* Two-Column Section: Projects & My Tasks */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Recent Projects */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Projects Overview</h3>
            <Link to="/projects" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {projects.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 'auto 0', textAlign: 'center', padding: '2rem 0' }}>
              No projects created yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {projects.slice(0, 5).map((project) => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/projects/${project._id}`)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'border-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '1rem' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {project.projectName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Created by {project.createdBy?.name || 'Admin'}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      project.status === 'Active' ? 'badge-success' : 'badge-neutral'
                    }`}
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Tasks */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>My Recent Tasks</h3>
            <Link to="/tasks" className="btn btn-ghost btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
              View all <ArrowRight size={14} />
            </Link>
          </div>

          {myTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 'auto 0', textAlign: 'center', padding: '2rem 0' }}>
              No tasks currently assigned to you.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {myTasks.slice(0, 5).map((task) => (
                <div
                  key={task._id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, marginRight: '1rem' }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {task.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Project: {task.projectId?.projectName || 'General'}
                    </div>
                  </div>
                  <span
                    className={`badge ${
                      task.status === 'Completed'
                        ? 'badge-success'
                        : task.status === 'In-progress'
                        ? 'badge-warning'
                        : 'badge-neutral'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
