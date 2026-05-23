import React from 'react';
import { X, Play, Star, Folder, Clock, Lock, Check } from 'lucide-react';

export default function DetailsModal({ course, onClose, onOpenPlayer, daysSincePurchase = 999 }) {
  if (!course) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(5,7,12,0.85)',
        backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: '1.5rem',
        animation: 'fadeIn 0.25s ease-out forwards'
      }}
    >
      <div
        className="desc-card"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
          padding: 0
        }}
      >
        <div style={{ height: '220px', backgroundImage: `url('${course.thumbnail}')`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--bg-card) 0%, rgba(0,0,0,0.15) 100%)' }}></div>
          <button className="btn-icon" onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.5)',
            borderRadius: '50%', zIndex: 10, width: '36px', height: '36px',
            border: '1px solid rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem 2rem 2.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <span className="badge green" style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: 'rgba(16,185,129,0.1)', color: 'var(--green)', fontWeight: 'bold' }}>✓ Disponible</span>
            <span className="badge gold" style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', background: 'rgba(212,175,55,0.1)', color: 'var(--gold)', fontWeight: 'bold' }}>★ Premium</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>{course.title}</h2>
          <p style={{ color: 'var(--text2)', marginBottom: '1.5rem', fontSize: '0.92rem', lineHeight: '1.6' }}>{course.description}</p>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', color: 'var(--text2)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Star size={16} color="var(--gold)" style={{ fill: 'var(--gold)' }} /> 5.0 Estrellas</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Folder size={16} color="var(--accent)" /> {course.lessons.length} Clases</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} color="var(--accent)" /> {course.duration}</span>
          </div>

          <button className="btn btn--primary" style={{ padding: '0.85rem', marginBottom: '2rem' }} onClick={() => onOpenPlayer(course.id)}>
            <Play size={18} /> Iniciar Entrenamiento
          </button>

          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--text)' }}>Estructura del Curso</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {course.lessons.length === 0 && <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Ninguna clase registrada todavía.</p>}
            {course.lessons.map((lesson, idx) => {
              const isUnlocked = daysSincePurchase >= lesson.dayUnlock;
              return (
                <div key={lesson.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', opacity: isUnlocked ? 1 : 0.55 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', width: '36px', height: '36px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem', color: 'var(--text2)' }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{lesson.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.15rem' }}>{isUnlocked ? `${lesson.duration} • Liberado` : `Bloqueado (Se libera en el día ${lesson.dayUnlock})`}</div>
                  </div>
                  {isUnlocked ? (
                    <button className="btn-icon" onClick={() => onOpenPlayer(course.id, lesson.id)} style={{
                      background: 'var(--accent)', width: '32px', height: '32px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
                      color: 'white', cursor: 'pointer'
                    }}>
                      <Play size={14} style={{ fill: 'white' }} />
                    </button>
                  ) : (
                    <Lock size={16} color="var(--text3)" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
