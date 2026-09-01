import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Plus,
  Search,
  ChevronRight,
  Edit2,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { projectApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_FILTERS = ['All', 'Active', 'Completed'];

export default function ProjectsPage() {
  const { isAdmin, hasOrg } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create Project Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ projectName: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Project Modal state
  const [editProject, setEditProject] = useState(null);
  const [editForm, setEditForm] = useState({ projectName: '', description: '', status: 'Active' });
  const [editLoading, setEditLoading] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await projectApi.getAll();
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasOrg) {
      fetchProjects();
    } else {
      setLoading(false);
    }
  }, [hasOrg]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (createForm.projectName.trim().length < 5 || createForm.projectName.trim().length > 30) {
      toast.error('Project name must be between 5 and 30 characters.');
      return;
    }
    if (createForm.description.trim().length < 5 || createForm.description.trim().length > 200) {
      toast.error('Description must be between 5 and 200 characters.');
      return;
    }

    setCreateLoading(true);
    try {
      await projectApi.create(createForm);
      toast.success('Project created successfully!');
      setCreateModalOpen(false);
      setCreateForm({ projectName: '', description: '' });
      fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.projectName.trim().length < 5 || editForm.projectName.trim().length > 30) {
      toast.error('Project name must be between 5 and 30 characters.');
      return;
    }
    if (editForm.description.trim().length < 5 || editForm.description.trim().length > 200) {
      toast.error('Description must be between 5 and 200 characters.');
      return;
    }

    setEditLoading(true);
    try {
      await projectApi.update(editProject._id, editForm);
      toast.success('Project updated!');
      setEditProject(null);
      fetchProjects();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (project, e) => {
    e.stopPropagation();
    setEditProject(project);
    setEditForm({
      projectName: project.projectName,
      description: project.description,
      status: project.status,
    });
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <LoadingSpinner text="Loading projects & deliverables..." />;
  }

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Projects & Products</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Manage active initiatives, deliverables, and team attachments
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Status Filters */}
        <div
          style={{
            display: 'flex',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            gap: '2px',
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

        {/* Search */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search
            size={16}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search projects..."
            className="form-input"
            style={{ paddingLeft: '2.125rem', height: '36px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={searchQuery || statusFilter !== 'All' ? 'No matching projects found' : 'No projects yet'}
          description={
            isAdmin
              ? 'Get started by creating your organization’s first project.'
              : 'No projects available in this organization.'
          }
          action={
            isAdmin && !searchQuery && statusFilter === 'All' ? (
              <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
                <Plus size={16} /> Create Project
              </button>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              className="card card-hoverable"
              onClick={() => navigate(`/projects/${project._id}`)}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    lineHeight: 1.3,
                  }}
                >
                  {project.projectName}
                </h3>
                <span
                  className={`badge ${
                    project.status === 'Active' ? 'badge-success' : 'badge-neutral'
                  }`}
                >
                  {project.status}
                </span>
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: '1.25rem',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {project.description}
              </p>

              <div
                style={{
                  paddingTop: '0.875rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                }}
              >
                <span>Lead: {project.createdBy?.name || 'Admin'}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isAdmin && (
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: '28px', height: '28px' }}
                      onClick={(e) => openEditModal(project, e)}
                      title="Edit project"
                    >
                      <Edit2 size={13} />
                    </button>
                  )}
                  <span style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary-light)', fontWeight: 600 }}>
                    Details <ChevronRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {createModalOpen && (
        <Modal
          title="Create New Project"
          onClose={() => setCreateModalOpen(false)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setCreateModalOpen(false)}
                disabled={createLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateSubmit}
                disabled={createLoading}
              >
                {createLoading ? 'Creating...' : 'Create Project'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-proj-name">
                Project Name (5–30 characters)
              </label>
              <input
                id="new-proj-name"
                type="text"
                required
                className="form-input"
                placeholder="E.g. Mobile E-Commerce Redesign"
                value={createForm.projectName}
                onChange={(e) => setCreateForm({ ...createForm, projectName: e.target.value })}
                minLength={5}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="new-proj-desc">
                Description (5–200 characters)
              </label>
              <textarea
                id="new-proj-desc"
                required
                className="form-textarea"
                placeholder="Briefly describe the goals, scope, or deliverables..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                minLength={5}
                maxLength={200}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project Modal */}
      {editProject && (
        <Modal
          title="Edit Project"
          onClose={() => setEditProject(null)}
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setEditProject(null)}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleEditSubmit}
                disabled={editLoading}
              >
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.projectName}
                onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })}
                minLength={5}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                required
                className="form-textarea"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                minLength={5}
                maxLength={200}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={editForm.status}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
