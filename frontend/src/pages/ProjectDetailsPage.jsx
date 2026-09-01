import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Plus,
  Calendar,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Circle,
  MoreVertical,
  Paperclip,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectApi, teamApi, taskApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const KANBAN_COLUMNS = [
  { key: 'Todo', label: 'To Do', color: '#64748b', icon: Circle },
  { key: 'In-progress', label: 'In Progress', color: '#f59e0b', icon: Clock },
  { key: 'Completed', label: 'Completed', color: '#10b981', icon: CheckCircle2 },
];

const PRIORITY_BADGE = {
  High: 'badge-danger',
  Medium: 'badge-warning',
  Low: 'badge-info',
};

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [project, setProject] = useState(null);
  const [attachedTeams, setAttachedTeams] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [assignableMembers, setAssignableMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab state: 'tasks' (Kanban) or 'teams'
  const [activeTab, setActiveTab] = useState('tasks');

  // Attach Team Modal
  const [attachModalOpen, setAttachModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [attachLoading, setAttachLoading] = useState(false);

  // Create Task Modal
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    name: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: '',
  });
  const [createTaskLoading, setCreateTaskLoading] = useState(false);

  // Edit Task Modal
  const [editTask, setEditTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({
    name: '',
    description: '',
    priority: 'Medium',
    dueDate: '',
  });
  const [editTaskLoading, setEditTaskLoading] = useState(false);

  // Delete Task Confirm
  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Detach Team Confirm
  const [detachTeamId, setDetachTeamId] = useState(null);

  const loadProjectData = useCallback(async () => {
    try {
      const [projRes, tasksRes, teamsRes, allTeamsRes] = await Promise.allSettled([
        projectApi.getById(projectId),
        taskApi.getByProject(projectId),
        projectApi.getAttachedTeams(projectId),
        teamApi.getAll(),
      ]);

      if (projRes.status === 'fulfilled') setProject(projRes.value.data.data);
      if (tasksRes.status === 'fulfilled') setTasks(tasksRes.value.data.data || []);
      if (allTeamsRes.status === 'fulfilled') setAllTeams(allTeamsRes.value.data.data || []);

      if (teamsRes.status === 'fulfilled') {
        const teamsData = teamsRes.value.data.data || [];
        setAttachedTeams(teamsData);

        // Fetch members of attached teams to determine who can be assigned tasks
        const memberPromises = teamsData.map((tp) =>
          teamApi.getMembers(tp.teamId?._id || tp.teamId)
        );
        const memberResults = await Promise.allSettled(memberPromises);

        const memberMap = new Map();
        memberResults.forEach((res) => {
          if (res.status === 'fulfilled') {
            const list = res.value.data.data || [];
            list.forEach((m) => {
              if (m.userId && !memberMap.has(m.userId._id)) {
                memberMap.set(m.userId._id, m.userId);
              }
            });
          }
        });
        setAssignableMembers(Array.from(memberMap.values()));
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, toast]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  // Handle Attach Team
  const handleAttachTeam = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) return;

    setAttachLoading(true);
    try {
      await projectApi.attachTeam(projectId, selectedTeamId);
      toast.success('Team attached to project!');
      setAttachModalOpen(false);
      setSelectedTeamId('');
      loadProjectData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAttachLoading(false);
    }
  };

  // Handle Detach Team
  const handleDetachTeam = async () => {
    if (!detachTeamId) return;
    try {
      await projectApi.detachTeam(projectId, detachTeamId);
      toast.success('Team detached.');
      setDetachTeamId(null);
      loadProjectData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Handle Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (taskForm.name.trim().length < 5 || taskForm.name.trim().length > 30) {
      toast.error('Task name must be between 5 and 30 characters.');
      return;
    }
    if (taskForm.description.trim().length < 5 || taskForm.description.trim().length > 200) {
      toast.error('Description must be between 5 and 200 characters.');
      return;
    }
    if (!taskForm.assignedTo) {
      toast.error('Please select an assignee.');
      return;
    }

    setCreateTaskLoading(true);
    try {
      await taskApi.create(projectId, {
        name: taskForm.name.trim(),
        description: taskForm.description.trim(),
        assignedTo: taskForm.assignedTo,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate || undefined,
      });
      toast.success('Task created successfully!');
      setCreateTaskModalOpen(false);
      setTaskForm({ name: '', description: '', assignedTo: '', priority: 'Medium', dueDate: '' });
      loadProjectData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreateTaskLoading(false);
    }
  };

  // Handle Edit Task
  const handleEditTask = async (e) => {
    e.preventDefault();
    setEditTaskLoading(true);
    try {
      await taskApi.update(editTask._id, {
        name: editTaskForm.name.trim(),
        description: editTaskForm.description.trim(),
        priority: editTaskForm.priority,
        dueDate: editTaskForm.dueDate || null,
      });
      toast.success('Task updated!');
      setEditTask(null);
      loadProjectData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditTaskLoading(false);
    }
  };

  // Handle Delete Task
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    setDeleteLoading(true);
    try {
      await taskApi.delete(deleteTaskId);
      toast.success('Task removed.');
      setDeleteTaskId(null);
      loadProjectData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Quick Status Switch
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskApi.updateStatus(taskId, newStatus);
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      toast.success(`Task moved to ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEditTaskModal = (task) => {
    setEditTask(task);
    setEditTaskForm({
      name: task.name,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
    });
  };

  if (loading) return <LoadingSpinner text="Loading project details..." />;
  if (!project) {
    return (
      <EmptyState
        title="Project Not Found"
        description="The requested project does not exist or you do not have permission to view it."
        action={
          <Link to="/projects" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Projects
          </Link>
        }
      />
    );
  }

  // Filter out teams already attached
  const attachedTeamIds = new Set(attachedTeams.map((tp) => tp.teamId?._id || tp.teamId));
  const availableTeamsToAttach = allTeams.filter((t) => !attachedTeamIds.has(t._id));

  return (
    <div>
      {/* Back button & top meta */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/projects')}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>
      </div>

      {/* Project Overview Card */}
      <div className="card" style={{ marginBottom: '1.75rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{project.projectName}</h1>
              <span
                className={`badge ${
                  project.status === 'Active' ? 'badge-success' : 'badge-neutral'
                }`}
              >
                {project.status}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '750px', lineHeight: 1.6 }}>
              {project.description}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isAdmin && (
              <button className="btn btn-secondary btn-sm" onClick={() => setAttachModalOpen(true)}>
                <Users size={14} /> Attach Team
              </button>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (attachedTeams.length === 0) {
                  toast.error('You must attach at least one team to this project before creating tasks.');
                  return;
                }
                setCreateTaskModalOpen(true);
              }}
            >
              <Plus size={14} /> Add Task
            </button>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <div>Owner: <strong style={{ color: 'var(--text-secondary)' }}>{project.createdBy?.name}</strong></div>
          <div>Attached Teams: <strong style={{ color: 'var(--text-secondary)' }}>{attachedTeams.length}</strong></div>
          <div>Total Tasks: <strong style={{ color: 'var(--text-secondary)' }}>{tasks.length}</strong></div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('tasks')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.625rem 0.25rem',
            borderBottom: activeTab === 'tasks' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'tasks' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Task Kanban ({tasks.length})
        </button>

        <button
          onClick={() => setActiveTab('teams')}
          style={{
            background: 'none',
            border: 'none',
            padding: '0.625rem 0.25rem',
            borderBottom: activeTab === 'teams' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'teams' ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          Attached Teams ({attachedTeams.length})
        </button>
      </div>

      {/* ── KANBAN BOARD TAB ──────────────────────────────────── */}
      {activeTab === 'tasks' && (
        <>
          {attachedTeams.length === 0 && (
            <div
              style={{
                padding: '0.875rem 1.25rem',
                backgroundColor: 'var(--warning-bg)',
                border: '1px solid var(--warning-border)',
                borderRadius: 'var(--radius-md)',
                color: '#fbbf24',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <span>
                <strong>Notice:</strong> No teams are attached to this project yet. A team must be attached before team members can be assigned tasks.
              </span>
              {isAdmin && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setAttachModalOpen(true)}
                  style={{ backgroundColor: '#1e293b' }}
                >
                  Attach Team Now
                </button>
              )}
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.25rem',
              alignItems: 'start',
            }}
          >
            {KANBAN_COLUMNS.map((column) => {
              const columnTasks = tasks.filter((t) => t.status === column.key);
              const ColIcon = column.icon;

              return (
                <div
                  key={column.key}
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.5)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1rem',
                    minHeight: '380px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {/* Column Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '1rem',
                      paddingBottom: '0.75rem',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <ColIcon size={16} color={column.color} />
                      <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{column.label}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-surface-elevated)',
                        padding: '0.125rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Task Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
                    {columnTasks.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.8125rem',
                          padding: '2.5rem 1rem',
                        }}
                      >
                        No tasks in {column.label}
                      </div>
                    ) : (
                      columnTasks.map((task) => (
                        <div
                          key={task._id}
                          className="card"
                          style={{
                            padding: '1rem',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-default)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.4, flex: 1, paddingRight: '0.5rem' }}>
                              {task.name}
                            </h4>
                            <span className={`badge ${PRIORITY_BADGE[task.priority] || 'badge-neutral'}`}>
                              {task.priority}
                            </span>
                          </div>

                          <p
                            style={{
                              fontSize: '0.8125rem',
                              color: 'var(--text-secondary)',
                              lineHeight: 1.5,
                              marginBottom: '0.875rem',
                            }}
                          >
                            {task.description}
                          </p>

                          {/* Due Date & Assignee */}
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '0.75rem',
                              color: 'var(--text-muted)',
                              marginBottom: '0.75rem',
                            }}
                          >
                            {task.dueDate ? (
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Calendar size={13} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </span>
                            ) : (
                              <span />
                            )}

                            {task.assignedTo && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                <Avatar
                                  name={task.assignedTo.name || 'Member'}
                                  src={task.assignedTo.profilePicture}
                                  size={22}
                                />
                                <span>{task.assignedTo.name}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Bar: Status Movement & Admin Options */}
                          <div
                            style={{
                              paddingTop: '0.625rem',
                              borderTop: '1px solid var(--border-subtle)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <select
                              className="form-select"
                              style={{
                                width: 'auto',
                                padding: '0.25rem 0.5rem',
                                fontSize: '0.75rem',
                                height: '28px',
                              }}
                              value={task.status}
                              onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            >
                              <option value="Todo">To Do</option>
                              <option value="In-progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>

                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                className="btn btn-ghost btn-icon"
                                style={{ width: '28px', height: '28px' }}
                                onClick={() => openEditTaskModal(task)}
                                title="Edit task"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                className="btn btn-ghost btn-icon"
                                style={{ width: '28px', height: '28px', color: '#f87171' }}
                                onClick={() => setDeleteTaskId(task._id)}
                                title="Delete task"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── ATTACHED TEAMS TAB ─────────────────────────────────── */}
      {activeTab === 'teams' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Teams Associated with this Project</h3>
            {isAdmin && availableTeamsToAttach.length > 0 && (
              <button className="btn btn-primary btn-sm" onClick={() => setAttachModalOpen(true)}>
                <Plus size={15} /> Attach Team
              </button>
            )}
          </div>

          {attachedTeams.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No teams attached"
              description="Attach a team to this project to enable team members to be assigned tasks."
              action={
                isAdmin && availableTeamsToAttach.length > 0 ? (
                  <button className="btn btn-primary" onClick={() => setAttachModalOpen(true)}>
                    <Plus size={16} /> Attach Team
                  </button>
                ) : null
              }
            />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {attachedTeams.map((tp) => {
                const team = tp.teamId;
                if (!team) return null;

                return (
                  <div key={tp._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem' }}>{team.teamName}</h4>
                      {isAdmin && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: '#f87171', padding: '0.25rem 0.5rem' }}
                          onClick={() => setDetachTeamId(team._id)}
                        >
                          Detach
                        </button>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', flex: 1, marginBottom: '1rem' }}>
                      {team.description || 'No description provided.'}
                    </p>
                    <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                      <Link to={`/teams/${team._id}`} style={{ fontSize: '0.8125rem', color: 'var(--primary-light)', fontWeight: 600 }}>
                        View Team Roster →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Attach Team Modal */}
      {attachModalOpen && (
        <Modal
          title="Attach Team to Project"
          onClose={() => setAttachModalOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setAttachModalOpen(false)} disabled={attachLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAttachTeam} disabled={attachLoading || !selectedTeamId}>
                {attachLoading ? 'Attaching...' : 'Attach Team'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAttachTeam}>
            <div className="form-group">
              <label className="form-label" htmlFor="select-team">
                Select Team from Organization
              </label>
              {availableTeamsToAttach.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  All available teams are already attached, or no teams exist.
                </p>
              ) : (
                <select
                  id="select-team"
                  className="form-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  required
                >
                  <option value="">-- Choose a team --</option>
                  {availableTeamsToAttach.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.teamName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Create Task Modal */}
      {createTaskModalOpen && (
        <Modal
          title="Add Task to Project"
          onClose={() => setCreateTaskModalOpen(false)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setCreateTaskModalOpen(false)}
                disabled={createTaskLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateTask}
                disabled={createTaskLoading || assignableMembers.length === 0}
              >
                {createTaskLoading ? 'Creating...' : 'Create Task'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateTask}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-name">Task Name (5–30 characters)</label>
              <input
                id="task-name"
                type="text"
                required
                className="form-input"
                placeholder="E.g. Implement user login API"
                value={taskForm.name}
                onChange={(e) => setTaskForm({ ...taskForm, name: e.target.value })}
                minLength={5}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-desc">Description (5–200 characters)</label>
              <textarea
                id="task-desc"
                required
                className="form-textarea"
                placeholder="Describe acceptance criteria or context..."
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                minLength={5}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="task-assignee">Assignee (from attached teams)</label>
              {assignableMembers.length === 0 ? (
                <div style={{ color: '#f87171', fontSize: '0.8125rem' }}>
                  No members found in attached teams. Add members to your attached teams first.
                </div>
              ) : (
                <select
                  id="task-assignee"
                  className="form-select"
                  value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                  required
                >
                  <option value="">-- Choose team member --</option>
                  {assignableMembers.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date (Optional)</label>
                <input
                  type="date"
                  className="form-input"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <Modal
          title="Edit Task"
          onClose={() => setEditTask(null)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setEditTask(null)}
                disabled={editTaskLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEditTask}
                disabled={editTaskLoading}
              >
                {editTaskLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleEditTask}>
            <div className="form-group">
              <label className="form-label">Task Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={editTaskForm.name}
                onChange={(e) => setEditTaskForm({ ...editTaskForm, name: e.target.value })}
                minLength={5}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                required
                className="form-textarea"
                value={editTaskForm.description}
                onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
                minLength={5}
                maxLength={200}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={editTaskForm.priority}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={editTaskForm.dueDate}
                  onChange={(e) => setEditTaskForm({ ...editTaskForm, dueDate: e.target.value })}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Task Confirm */}
      {deleteTaskId && (
        <ConfirmDialog
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDeleteTask}
          onCancel={() => setDeleteTaskId(null)}
          loading={deleteLoading}
        />
      )}

      {/* Detach Team Confirm */}
      {detachTeamId && (
        <ConfirmDialog
          title="Detach Team from Project"
          message="Are you sure you want to detach this team from the project?"
          confirmLabel="Detach Team"
          onConfirm={handleDetachTeam}
          onCancel={() => setDetachTeamId(null)}
        />
      )}
    </div>
  );
}
