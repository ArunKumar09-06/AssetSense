import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Shield,
  Building2,
  Camera,
  LogOut,
  Upload,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api';
import { useToast } from '../context/ToastContext';
import Avatar from '../components/Avatar';

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, or WEBP images are supported.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setPreviewSrc(previewUrl);

    const formData = new FormData();
    formData.append('profilePicture', file);

    setUploading(true);
    try {
      const res = await authApi.updateProfilePicture(formData);
      toast.success('Profile picture updated!');
      updateUser(res.data.data);
    } catch (err) {
      toast.error(err.message);
      setPreviewSrc(null);
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const org = user?.organizationId;
  const orgName = typeof org === 'object' ? org?.orgName : null;

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Account Profile</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Personal identity, security role, and workspace affiliation
        </p>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
        {/* Avatar Upload Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '2rem',
          }}
        >
          <div style={{ position: 'relative' }}>
            <Avatar
              name={user?.name || ''}
              src={previewSrc || user?.profilePicture}
              size={80}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: '2px solid var(--bg-surface)',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
              title="Upload new profile picture"
            >
              <Camera size={14} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <span className={`badge ${user?.role === 'admin' ? 'badge-info' : 'badge-neutral'}`}>
                {user?.role === 'admin' ? 'Organization Admin' : 'Team Member'}
              </span>
              {uploading && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>
                  Uploading image...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <User size={14} /> Full Name
            </label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>
              {user?.name}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Mail size={14} /> Email Address
            </label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>
              {user?.email}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Building2 size={14} /> Workspace Organization
            </label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem' }}>
              {orgName || 'Not yet attached to an organization'}
            </div>
          </div>

          <div>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Shield size={14} /> Account Role
            </label>
            <div style={{ fontSize: '0.95rem', fontWeight: 500, marginTop: '0.25rem', textTransform: 'capitalize' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Action */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Sign Out</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
            Safely terminate your current session
          </div>
        </div>

        <button className="btn btn-danger" onClick={handleLogout}>
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </div>
  );
}
