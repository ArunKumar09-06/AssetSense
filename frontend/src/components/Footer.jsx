import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-app)',
        padding: '4rem 2rem 2.5rem',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              A
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>AssetSense</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Modern product and project management system designed for speed, clarity, and accountability.
          </p>
        </div>

        <div>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Product
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li>
              <button onClick={() => scrollTo('features')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
                Features
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo('about')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
                About Platform
              </button>
            </li>
            <li>
              <button onClick={() => scrollTo('contact')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', font: 'inherit' }}>
                Contact
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Account
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <li><Link to="/login" style={{ color: 'inherit' }}>Sign In</Link></li>
            <li><Link to="/register" style={{ color: 'inherit' }}>Create Account</Link></li>
            <li><Link to="/dashboard" style={{ color: 'inherit' }}>Workspace Dashboard</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Security & Stack
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
            Secured via HTTP-only JWT cookies, bcrypt encryption, and role-based access control.
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}
      >
        <div>© {new Date().getFullYear()} AssetSense Management System. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
