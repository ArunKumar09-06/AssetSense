import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  UserPlus,
  Trash2,
  Shield,
  Mail,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { teamApi, orgApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function TeamDetailPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Member Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Remove Member Confirm
  const [removeUserId, setRemoveUserId] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  const loadTeamData = useCallback(async () => {
    try {
      const [teamRes, membersRes, orgMembersRes] = await Promise.allSettled([
        teamApi.getById(teamId),
        teamApi.getMembers(teamId),
        orgApi.getMembers(),
      ]);

      if (teamRes.status === 'fulfilled') setTeam(teamRes.value.data.data);
      if (membersRes.status === 'fulfilled') setMembers(membersRes.value.data.data || []);
      if (orgMembersRes.status === 'fulfilled') setOrgMembers(orgMembersRes.value.data.data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [teamId, toast]);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  // Handle Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setAddLoading(true);
    try {
      await teamApi.addMember(teamId, selectedUserId);
      toast.success('Member added to team!');
      setAddModalOpen(false);
      setSelectedUserId('');
      loadTeamData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setAddLoading(false);
    }
  };

  // Handle Remove Member
  const handleRemoveMember = async () => {
    if (!removeUserId) return;
    setRemoveLoading(true);
    try {
      await teamApi.removeMember(teamId, removeUserId);
      toast.success('Member removed from team.');
      setRemoveUserId(null);
      loadTeamData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading team roster..." />;
  if (!team) {
    return (
      <EmptyState
        title="Team Not Found"
        description="The team you are trying to view does not exist or has been removed."
        action={
          <button className="btn btn-secondary" onClick={() => navigate('/teams')}>
            <ArrowLeft size={16} /> Back to Teams
          </button>
        }
      />
    );
  }

  // Filter org members who are NOT already in this team
  const currentMemberUserIds = new Set(members.map((m) => m.userId?._id));
  const availableOrgMembers = orgMembers.filter((u) => !currentMemberUserIds.has(u._id));

  return (
    <div>
      {/* Back Link */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button
          onClick={() => navigate('/teams')}
          className="btn btn-ghost btn-sm"
          style={{ paddingLeft: 0, color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} /> Back to Teams
        </button>
      </div>

      {/* Team Header Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.375rem' }}>
              {team.teamName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '680px', lineHeight: 1.6 }}>
              {team.description || 'No description provided for this team.'}
            </p>
          </div>

          {isAdmin && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                if (availableOrgMembers.length === 0) {
                  toast.info('All organization members are already part of this team.');
                  return;
                }
                setAddModalOpen(true);
              }}
            >
              <UserPlus size={15} /> Add Member
            </button>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            paddingTop: '1.25rem',
            marginTop: '1.25rem',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
          }}
        >
          <div>Created by: <strong style={{ color: 'var(--text-secondary)' }}>{team.createdBy?.name || 'Admin'}</strong></div>
          <div>Total Members: <strong style={{ color: 'var(--text-secondary)' }}>{members.length}</strong></div>
        </div>
      </div>

      {/* Member Roster */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Team Roster</h2>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
      </div>

      {members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No members in this team"
          description="Add members from your organization to start collaborating."
          action={
            isAdmin && availableOrgMembers.length > 0 ? (
              <button className="btn btn-primary" onClick={() => setAddModalOpen(true)}>
                <UserPlus size={16} /> Add Member
              </button>
            ) : null
          }
        />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                {isAdmin && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const u = m.userId;
                if (!u) return null;
                const isCurrent = u._id === user?.id;

                return (
                  <tr key={m._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Avatar name={u.name} src={u.profilePicture} size={34} />
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                            {u.name} {isCurrent && <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem' }}>(You)</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                    </td>
                    {isAdmin && (
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          style={{ color: '#f87171', display: 'inline-flex' }}
                          onClick={() => setRemoveUserId(u._id)}
                          title="Remove from team"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Member Modal */}
      {addModalOpen && (
        <Modal
          title="Add Member to Team"
          onClose={() => setAddModalOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setAddModalOpen(false)} disabled={addLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleAddMember} disabled={addLoading || !selectedUserId}>
                {addLoading ? 'Adding...' : 'Add Member'}
              </button>
            </>
          }
        >
          <form onSubmit={handleAddMember}>
            <div className="form-group">
              <label className="form-label" htmlFor="select-user">
                Select Organization Member
              </label>
              {availableOrgMembers.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  All members of this organization are already in this team.
                </p>
              ) : (
                <select
                  id="select-user"
                  className="form-select"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">-- Choose member --</option>
                  {availableOrgMembers.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) — {u.role}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Remove Member Confirm */}
      {removeUserId && (
        <ConfirmDialog
          title="Remove Team Member"
          message="Are you sure you want to remove this user from the team? They will no longer be eligible for task assignments in associated projects."
          confirmLabel="Remove Member"
          onConfirm={handleRemoveMember}
          onCancel={() => setRemoveUserId(null)}
          loading={removeLoading}
        />
      )}
    </div>
  );
}
