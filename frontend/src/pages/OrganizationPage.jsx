import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Users, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orgApi } from '../api';
import { useToast } from '../context/ToastContext';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function OrganizationPage() {
  const { user, isAdmin, hasOrg, refetchUser } = useAuth();
  const toast = useToast();

  const [organization, setOrganization] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Org state (for users who haven't created one)
  const [createForm, setCreateForm] = useState({ orgName: '', description: '' });
  const [createLoading, setCreateLoading] = useState(false);

  // Edit Org state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ orgName: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);

  const loadOrgData = useCallback(async () => {
    if (!hasOrg) {
      setLoading(false);
      return;
    }

    try {
      const [orgRes, membersRes] = await Promise.allSettled([
        orgApi.getMe(),
        orgApi.getMembers(),
      ]);

      if (orgRes.status === 'fulfilled') {
        const orgData = orgRes.value.data.data;
        setOrganization(orgData);
        setEditForm({ orgName: orgData.orgName, description: orgData.description });
      }

      if (membersRes.status === 'fulfilled') {
        setMembers(membersRes.value.data.data || []);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [hasOrg, toast]);

  useEffect(() => {
    loadOrgData();
  }, [loadOrgData]);

  // Create organization
  const handleCreateOrg = async (e) => {
    e.preventDefault();
    if (createForm.orgName.trim().length < 5 || createForm.orgName.trim().length > 30) {
      toast.error('Organization name must be between 5 and 30 characters.');
      return;
    }
    if (!createForm.description.trim()) {
      toast.error('Organization description is required.');
      return;
    }

    setCreateLoading(true);
    try {
      await orgApi.create(createForm);
      toast.success('Organization created! You are now an Admin.');
      await refetchUser();
      loadOrgData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreateLoading(false);
    }
  };

  // Update organization
  const handleUpdateOrg = async (e) => {
    e.preventDefault();
    if (editForm.orgName.trim().length < 5 || editForm.orgName.trim().length > 30) {
      toast.error('Organization name must be between 5 and 30 characters.');
      return;
    }

    setEditLoading(true);
    try {
      const res = await orgApi.update(editForm);
      toast.success('Organization updated successfully!');
      setOrganization(res.data.data);
      setEditModalOpen(false);
      await refetchUser();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading organization workspace..." />;

  // User has no organization: show Create Organization form
  if (!hasOrg) {
    return (
      <div style={{ maxWidth: '580px', margin: '2rem auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '12px',
              backgroundColor: 'var(--primary-muted)',
              color: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <Building2 size={26} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Organization</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Set up an organization hub to start managing projects, teams, and member roles.
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <form onSubmit={handleCreateOrg}>
            <div className="form-group">
              <label className="form-label" htmlFor="org-name">
                Organization Name (5–30 characters)
              </label>
              <input
                id="org-name"
                type="text"
                required
                className="form-input"
                placeholder="E.g. Acme Innovations Inc."
                value={createForm.orgName}
                onChange={(e) => setCreateForm({ ...createForm, orgName: e.target.value })}
                minLength={5}
                maxLength={30}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="org-desc">
                Description
              </label>
              <textarea
                id="org-desc"
                required
                className="form-textarea"
                placeholder="Company domain, mission, or organization scope..."
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={createLoading}
              style={{ width: '100%', padding: '0.7rem' }}
            >
              {createLoading ? 'Setting up workspace...' : 'Establish Organization Workspace'}
            </button>
          </form>
        </div>
      </div>
    );
  }

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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Organization Workspace</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            General configuration and team member directory
          </p>
        </div>

        {isAdmin && (
          <button className="btn btn-secondary btn-sm" onClick={() => setEditModalOpen(true)}>
            <Edit2 size={14} /> Edit Details
          </button>
        )}
      </div>

      {/* Organization Overview Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: '10px',
              backgroundColor: 'var(--primary-muted)',
              color: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{organization?.orgName}</h2>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Created by {organization?.createdBy?.name || 'Admin'}
            </span>
          </div>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, maxWidth: '750px' }}>
          {organization?.description}
        </p>
      </div>

      {/* Members Directory */}
      <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Organization Members</h3>
        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
          {members.length} registered member{members.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Member Since</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const isCurrent = member._id === user?.id;

              return (
                <tr key={member._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Avatar name={member.name} src={member.profilePicture} size={32} />
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {member.name} {isCurrent && <span style={{ color: 'var(--primary-light)', fontSize: '0.75rem' }}>(You)</span>}
                      </span>
                    </div>
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span className={`badge ${member.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td>
                    {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Organization Modal */}
      {editModalOpen && (
        <Modal
          title="Edit Organization Details"
          onClose={() => setEditModalOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)} disabled={editLoading}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleUpdateOrg} disabled={editLoading}>
                {editLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          }
        >
          <form onSubmit={handleUpdateOrg}>
            <div className="form-group">
              <label className="form-label">Organization Name (5–30 characters)</label>
              <input
                type="text"
                required
                className="form-input"
                value={editForm.orgName}
                onChange={(e) => setEditForm({ ...editForm, orgName: e.target.value })}
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
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
