import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Users,
  CheckCircle,
  ShieldCheck,
  ArrowRight,
  Send,
  Workflow,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Product & Project Tracking',
    description:
      'Organize your catalog of projects and deliverables with defined descriptions, status indicators, and ownership.',
  },
  {
    icon: Workflow,
    title: 'Visual Kanban Workflows',
    description:
      'Track tasks in real time across Todo, In-progress, and Completed stages with integrated priority and due-date management.',
  },
  {
    icon: Users,
    title: 'Team Workspaces',
    description:
      'Create functional teams, assign organization members, and link teams directly to specific project initiatives.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Governance',
    description:
      'Admins oversee strategy, project initialization, and team rosters, while members focus seamlessly on their assigned tasks.',
  },
  {
    icon: CheckCircle,
    title: 'Personal Task Queues',
    description:
      'Every collaborator receives a centralized view of all tasks assigned to them across projects with one-click status updating.',
  },
  {
    icon: Sparkles,
    title: 'Enterprise Organization Hub',
    description:
      'Unify all your operations under a single organization workspace with shared team visibility and member directories.',
  },
];

export default function LandingPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setContactForm({ name: '', email: '', message: '' });
    setTimeout(() => setContactSubmitted(false), 5000);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <section
        id="hero"
        style={{
          padding: '8.5rem 2rem 5rem',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.875rem',
            backgroundColor: 'var(--primary-muted)',
            border: '1px solid var(--primary-border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--primary-light)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: 'var(--success)',
              display: 'inline-block',
            }}
          />
          Production-Ready Product Management
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            lineHeight: 1.15,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
          }}
        >
          Manage Your Products.{' '}
          <span style={{ color: 'var(--primary-light)' }}>Simplify Your Business.</span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'var(--text-secondary)',
            maxWidth: '640px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
          }}
        >
          DevCollab gives your organization the clarity to coordinate teams, attach projects,
          and track task execution through a clean, distraction-free interface.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started <ArrowRight size={17} />
          </Link>
          <button onClick={() => scrollToSection('features')} className="btn btn-secondary btn-lg">
            Explore Features
          </button>
        </div>

        {/* Dashboard Preview Representation */}
        <div
          style={{
            marginTop: '4rem',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            backgroundColor: 'var(--bg-surface)',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}
        >
          {/* Mockup Topbar */}
          <div
            style={{
              height: '42px',
              backgroundColor: 'var(--bg-input)',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 1rem',
              gap: '0.5rem',
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <div
              style={{
                margin: '0 auto',
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              devcollab.app/dashboard
            </div>
          </div>

          {/* Mockup Canvas */}
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Projects</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>12</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>Across 4 assigned teams</div>
            </div>
            <div className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Tasks</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>64</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--info)' }}>48 completed this sprint</div>
            </div>
            <div className="card" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Team Velocity</div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--text-primary)' }}>96%</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)' }}>On-time task delivery</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES SECTION ────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: '5rem 2rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', marginBottom: '0.75rem' }}>
              Engineered for Product Operations
            </h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto', fontSize: '1rem' }}>
              Everything your team needs to build, maintain, and deliver without unnecessary bloat.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {FEATURES.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <div key={index} className="card">
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: '10px',
                      backgroundColor: 'var(--primary-muted)',
                      color: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1.25rem',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                    {feat.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── ABOUT SECTION ───────────────────────────────────────── */}
      <section
        id="about"
        style={{
          padding: '6rem 2rem',
          maxWidth: '1200px',
          margin: '0 auto',
          width: '100%',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '0.5rem' }}>
              About The Platform
            </div>
            <h2 style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Built for teams that value focus over feature bloat
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
              DevCollab was created to eliminate the friction commonly found in over-complicated project tools.
              Instead of navigating through endless configuration screens, teams can organize their projects, 
              form squads, and assign tasks with strict role authorization.
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7 }}>
              Designed for technical teams, agencies, and product organizations, DevCollab keeps your data
              clean and your team synchronized on what matters today.
            </p>
          </div>

          <div
            className="card"
            style={{
              padding: '2rem',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Core Guarantees</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { title: 'Strict Access Control', desc: 'Admins maintain authoritative governance over projects and teams.' },
                { title: 'Team-Project Coupling', desc: 'Tasks can only be assigned to members actively working on that project.' },
                { title: 'Cookie-Secured Sessions', desc: 'HTTP-only authentication tokens prevent client-side credential tampering.' },
              ].map((item, idx) => (
                <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <CheckCircle size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.15rem' }}>{item.desc}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ─────────────────────────────────────── */}
      <section
        id="contact"
        style={{
          padding: '5rem 2rem 6rem',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary-light)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Contact Us
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Have questions or feedback?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem' }}>
            Reach out to our product team. We typically respond within one business day.
          </p>

          {contactSubmitted ? (
            <div
              className="card"
              style={{
                backgroundColor: 'var(--success-bg)',
                borderColor: 'var(--success-border)',
                padding: '2rem',
                textAlign: 'center',
              }}
            >
              <CheckCircle size={36} color="var(--success)" style={{ margin: '0 auto 0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', color: 'var(--success)', marginBottom: '0.375rem' }}>
                Thank you for your message!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Our team has received your inquiry and will reach out shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleContactSubmit} className="card" style={{ textAlign: 'left', padding: '2rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="contact-name">Your Name</label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Jane Smith"
                  className="form-input"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-email">Email Address</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className="form-input"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="contact-message">Message</label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  placeholder="How can we assist your team?"
                  className="form-textarea"
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
