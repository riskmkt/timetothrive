import React from 'react';
import { Crown, X, Play, Settings, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient.js';

export default function Drawer({ open, onClose, session, view, onNavigate }) {
  return (
    <>
      {open && <div className="drawer-overlay" onClick={onClose} style={{ display: 'block' }} />}
      <div className={`drawer ${open ? 'open' : ''}`} style={{ borderLeft: '1px solid var(--border)' }}>
        <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: 'var(--text)' }}>
            <Crown color="var(--gold)" size={20} /> Perfil del Alumno
          </div>
          <button className="btn-icon" onClick={onClose} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: 'white' }}>
              {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text)' }}>
                {session?.user?.email 
                  ? session.user.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + session.user.email.split('@')[0].split('.')[0].slice(1) 
                  : 'Alumno Premium'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)' }}>{session?.user?.email || 'aluno@horadeprosperar.com'}</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 0', flex: 1, overflowY: 'auto' }}>
          <div className={`drawer-menu-item ${view === 'home' ? 'active' : ''}`} onClick={() => { onNavigate('home'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', color: 'var(--text2)' }}>
            <Play size={18} /> Inicio (Dashboard)
          </div>
          {session?.user?.email === 'icaroxzm@gmail.com' && (
            <div className="drawer-menu-item" onClick={() => { onNavigate('admin'); onClose(); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', color: 'var(--text2)' }}>
              <Settings size={18} /> Panel Administrativo
            </div>
          )}
          <div className="drawer-menu-item" onClick={() => supabase.auth.signOut()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 24px', color: '#EF4444', marginTop: 'auto' }}>
            <LogOut size={18} /> Cerrar Sesión
          </div>
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)', fontSize: '11px', color: 'var(--text3)', textAlign: 'center' }}>
          Plataforma Exclusiva © Hora de Prosperar
        </div>
      </div>
    </>
  );
}