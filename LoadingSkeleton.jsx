import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="pcard" style={{ animation: 'pulse 1.5s infinite ease-in-out', background: 'var(--bg-card)' }}>
      <div className="pcard__img-wrap" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
      <div className="pcard__body">
        <div style={{ width: '40%', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '12px' }}></div>
        <div style={{ width: '80%', height: '20px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginBottom: '16px' }}></div>
        <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '8px' }}></div>
        <div style={{ width: '90%', height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '24px' }}></div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ width: '30%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
          <div style={{ width: '30%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)' }}></div>
          <div style={{ flex: 1, height: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;
