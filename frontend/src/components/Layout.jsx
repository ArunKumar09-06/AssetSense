import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="main-wrapper">
        {/* Mobile Header Bar */}
        <div
          className="mobile-header"
          style={{
            height: '56px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1rem',
            position: 'sticky',
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>DevCollab</span>
          <div style={{ width: 36 }} />
        </div>

        <main className="content-container">{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
