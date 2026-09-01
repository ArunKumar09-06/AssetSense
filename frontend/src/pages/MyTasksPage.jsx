import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckSquare,
  Calendar,
  FolderKanban,
  Clock,
  CheckCircle2,
  Circle,
  Filter,
} from 'lucide-react';
import { taskApi } from '../api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const STATUS_FILTERS = ['All', 'Todo', 'In-progress', 'Completed'];

const PRIORITY_BADGE = {
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-info',
};

export default function MyTasksPage() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const fetchMyTasks = async () => {
    try {
      const res = await taskApi.getMyTasks();
      setTasks(res.data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      await taskApi.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = tasks.filter(
    (t) => statusFilter === 'All' || t.status === statusFilter
  );

  const todoCount = tasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  if (loading) return <LoadingSpinner text="Loading your assigned tasks..." />;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>My Tasks</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Consolidated task queue assigned to you across all projects
        </p>
      </div>

      {/* Metrics Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            To Do
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{todoCount}</div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            In Progress
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#fbbf24' }}>
            {inProgressCount}
          </div>
        </div>

        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Completed
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem', color: '#34d399' }}>
            {completedCount}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '3px',
          gap: '2px',
          marginBottom: '1.5rem',
          width: 'fit-content',
        }}
      >
        {STATUS_FILTERS.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              padding: '0.35rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: 600,
              backgroundColor: statusFilter === status ? 'var(--primary)' : 'transparent',
              color: statusFilter === status ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks found"
          description={
            statusFilter !== 'All'
              ? `You have no tasks marked as "${statusFilter}".`
              : 'You do not have any tasks assigned to you right now.'
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTasks.map((task) => {
            const isDue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'Completed';

            return (
              <div
                key={task._id}
                className="card"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  borderLeft: `4px solid ${
                    task.status === 'Completed'
                      ? 'var(--success)'
                      : task.status === 'In-progress'
                      ? 'var(--warning)'
                      : 'var(--border-default)'
                  }`,
                }}
              >
                <div style={{ flex: 1, minWidth: '240px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>{task.name}</h3>
                    <span className={`badge ${PRIORITY_BADGE[task.priority] || 'badge-neutral'}`}>
                      {task.priority}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                    {task.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    {task.projectId && (
                      <Link
                        to={`/projects/${task.projectId._id || task.projectId}`}
                        style={{ color: 'var(--primary-light)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}
                      >
                        <FolderKanban size={13} />
                        {task.projectId?.projectName || 'Project'}
                      </Link>
                    )}

                    {task.dueDate && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: isDue ? '#f87171' : 'inherit' }}>
                        <Calendar size={13} />
                        {new Date(task.dueDate).toLocaleDateString()} {isDue && '(Overdue)'}
                      </span>
                    )}

                    <span>Created by: {task.createdBy?.name || 'Lead'}</span>
                  </div>
                </div>

                {/* Status Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status:</span>
                  <select
                    className="form-select"
                    style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
                    value={task.status}
                    disabled={updatingTaskId === task._id}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="Todo">To Do</option>
                    <option value="In-progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
