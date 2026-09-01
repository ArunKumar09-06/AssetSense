import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Plus, Edit2, Trash2, ChevronRight, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export default function TeamsPage() {
  const { isAdmin, hasOrg } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Team Modal
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ teamName: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Team Modal
  const [editTeam, setEditTeam] = useState(null);
  const [editForm, setEditForm] = useState({ teamName: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);

  // Delete Team Confirm
  const [deleteTeamId, setDeleteTeamId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTeams = async () => {
    try {
      const res = await teamApi.getAll();
      setTeams(res.data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasOrg) {
      fetchTeams();
    } else {
      setLoading(false);
    }
  }, [hasOrg]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (createForm.teamName.trim().length < 3 || createForm.teamName.trim().length > 30) {
      toast.error('Team name must be between 3 and 30 characters.');
      return;
    }

    setCreateLoading(true);
    try {
      await teamApi.create(createForm);
      toast.success('Team created successfully!');
      setCreateModalOpen(false);
      setCreateForm({ teamName: '', description: '' });
      fetchTeams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (editForm.teamName.trim().length < 3 || editForm.teamName.trim().length > 30) {
      toast.error('Team name must be between 3 and 30 characters.');
      return;
    }

    setEditLoading(true);
    try {
      await teamApi.update(editTeam._id, editForm);
      toast.success('Team updated!');
      setEditTeam(null);
      fetchTeams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deleteTeamId) return;
    setDeleteLoading(true);
    try {
      await teamApi.delete(deleteTeamId);
      toast.success('Team deleted.');
      setDeleteTeamId(null);
      fetchTeams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (team, e) => {
    e.stopPropagation();
    setEditTeam(team);
    setEditForm({ teamName: team.teamName, description: team.description || '' });
  };

  if (loading) return <LoadingSpinner text="Loading organization teams..." />;

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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Teams</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Functional units and squads operating across projects
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
            <Plus size={16} /> New Team
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No teams created yet"
          description={
            isAdmin
              ? 'Create functional teams to group members and assign tasks to projects.'
              : 'No teams have been established in this organization yet.'
          }
          action={
            isAdmin ? (
              <button className="btn btn-primary" onClick={() => setCreateModalOpen(true)}>
                <Plus size={16} /> Create Team
              </button>
            ) : null
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {teams.map((team) => (
            <div
              key={team._id}
              className="card card-hoverable"
              onClick={() => navigate(`/teams/${team._id}`)}
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  marginBottom: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '8px',
                      backgroundColor: 'var(--primary-muted)',
                      color: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Users size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{team.teamName}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      by {team.createdBy?.name || 'Admin'}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: '28px', height: '28px' }}
                      onClick={(e) => openEditModal(team, e)}
                      title="Edit team"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      style={{ width: '28px', height: '28px', color: '#f87171' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTeamId(team._id);
                      }}
                      title="Delete team"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: 1.6,
                  flex: 1,
                  marginBottom: '1.25rem',
                }}
              >
                {team.description || 'No focus description set.'}
              </p>

              <div
                style={{
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                  color: 'var(--primary-light)',
                  fontWeight: 600,
                }}
              >
                <span>Manage Team Roster</span>
                <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      {createModalOpen && (
        <Modal
          title="Create New Team"
          onClose={() => setCreateModalOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setCreateModalOpen(false)} disabled={createLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateSubmit} disabled={createLoading}>
                {createLoading ? 'Creating...' : 'Create Team'}
              </button>
            </>
          }
        >
          <form onSubmit={handleCreateSubmit}>
            <div className="form-group">
              <label className="form-label">Team Name (3–30 characters)</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="E.g. Frontend Engineering, QA Squad"
                value={createForm.teamName}
                onChange={(e) => setCreateForm({ ...createForm, teamName: e.target.value })}
                minLength={3}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description (Optional, max 200 characters)</label>
              <textarea
                className="form-textarea"
                placeholder="Responsibilities or focus area..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                maxLength={200}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Team Modal */}
      {editTeam && (
        <Modal
          title="Edit Team"
          onClose={() => setEditTeam(null)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setEditTeam(null)} disabled={editLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleEditSubmit} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleEditSubmit}>
            <div className="form-group">
              <label className="form-label">Team Name</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.teamName}
                onChange={(e) => setEditForm({ ...editForm, teamName: e.target.value })}
                minLength={3}
                maxLength={30}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                maxLength={200}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Team Confirm */}
      {deleteTeamId && (
        <ConfirmDialog
          title="Delete Team"
          message="Are you sure you want to delete this team? All member memberships and project attachments will be deleted."
          onConfirm={handleDeleteSubmit}
          onCancel={() => setDeleteTeamId(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}
