import React from 'react';

const COLORS = [
  '#4f46e5', '#0ea5e9', '#10b981', '#f59e0b',
  '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'
];

function getInitialColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name = '') {
  return name
    .trim()
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U';
}

export default function Avatar({ name, src, size = 36, className = '' }) {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(name);
  const bgColor = getInitialColor(name);
  
  // Format avatar URL if relative path from backend
  const resolvedSrc = src && !src.startsWith('http') && !src.startsWith('/default')
    ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${src}`
    : src;

  const isDefaultImage = !src || src.includes('default-profile');

  if (resolvedSrc && !isDefaultImage && !imgError) {
    return (
      <img
        src={resolvedSrc}
        alt={name || 'User Avatar'}
        onError={() => setImgError(true)}
        className={className}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          border: '1px solid var(--border-default)',
        }}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bgColor,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: Math.max(size * 0.38, 11),
        flexShrink: 0,
        letterSpacing: '0.02em',
        userSelect: 'none',
      }}
    >
      {initials}
    </div>
  );
}
