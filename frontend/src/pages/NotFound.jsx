import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: 'var(--space-4)',
      textAlign: 'center',
      animation: 'fade-in 0.3s ease',
    }}>
      <div style={{
        width: 80,
        height: 80,
        background: 'var(--critical-light)',
        border: '1px solid var(--critical-border)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--critical-color)',
        marginBottom: 'var(--space-2)',
      }}>
        <AlertCircle size={36} />
      </div>
      <h1 style={{ fontSize: 'var(--font-3xl)', fontWeight: 800, letterSpacing: '-1px', color: 'var(--text-primary)' }}>
        404
      </h1>
      <p style={{ fontSize: 'var(--font-md)', color: 'var(--text-secondary)', maxWidth: 360 }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/')}>
        <Home size={16} /> Return to Dashboard
      </button>
    </div>
  );
};

export default NotFound;
