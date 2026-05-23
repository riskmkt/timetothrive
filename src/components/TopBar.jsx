import React from 'react';
import { ChevronLeft, Crown, Settings } from 'lucide-react';

export default function TopBar({ view, setView, title, subtitle, onOpenDrawer, session, isAdmin }) {
  const username = session?.user?.email
    ? session.user.email.split('@')[0].split('.')[0]
    : 'Alumno Premium';
  const displayName = username === 'Alumno Premium'
    ? username
    : username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <header className="topnav">
      <div className="topnav__inner">
        <div className="topnav__left">
          {view !== 'home' && (
            <button className="topnav__back" onClick={() => setView('home')}>
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="topnav__brand" onClick={() => setView('home')} style={{ cursor: 'pointer' }}>
            <Crown className="topnav__logo-icon" color="var(--gold)" size={22} />
            <span className="topnav__title">Hora de Prosperar</span>
          </div>
        </div>
        <div className="topnav__right">
          {isAdmin && (
            <button className="topnav__icon-btn" onClick={() => setView('admin')} title="Panel Administrativo" aria-label="Panel Administrativo">
              <Settings size={20} />
            </button>
          )}
          <div className="topnav__user" onClick={onOpenDrawer}>
            <div className="topnav__avatar" style={{ background: 'var(--accent)' }}>
              <Crown size={14} color="white" />
            </div>
            <span className="topnav__username">{displayName}</span>
          </div>
        </div>
      </div>
      {view === 'player' && (
        <div className="topnav__course-title">
          Estás viendo: <strong style={{ color: 'var(--text)' }}>{title}</strong> {subtitle && `• ${subtitle}`}
        </div>
      )}
    </header>
  );
}
