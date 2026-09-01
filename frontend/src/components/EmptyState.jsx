import React from 'react';

export default function EmptyState({
  icon: Icon,
  title = 'No items found',
  description,
  action,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        border: '1px dashed var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        background: 'rgba(15, 23, 42, 0.4)',
      }}
    >
      {Icon && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '12px',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <Icon size={24} />
        </div>
      )}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.375rem' }}>
        {title}
      </h3>
      {description && (
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            maxWidth: 380,
            lineHeight: 1.6,
            marginBottom: action ? '1.5rem' : '0',
          }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
