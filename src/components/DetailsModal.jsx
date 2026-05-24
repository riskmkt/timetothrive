import React, { useEffect, useState } from 'react';
import { X, Play, Star, Folder, Clock, Lock, Check, ChevronDown, ChevronUp, FileText } from 'lucide-react';

export default function DetailsModal({ course, onClose, onOpenPlayer, daysSincePurchase = 999 }) {
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const [expandedSections, setExpandedSections] = useState(() => new Set(['course-info', 'course-structure']));
  const [expandedLessons, setExpandedLessons] = useState(() => new Set(lessons[0]?.id ? [lessons[0].id] : []));

  useEffect(() => {
    setExpandedLessons(new Set(lessons[0]?.id ? [lessons[0].id] : []));
  }, [course?.id]);

  if (!course) return null;

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleLesson = (lessonId) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

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
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Folder size={16} color="var(--accent)" /> {lessons.length} Clases</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16} color="var(--accent)" /> {course.duration}</span>
          </div>

          <button className="btn btn--primary" style={{ padding: '0.85rem', marginBottom: '2rem' }} onClick={() => onOpenPlayer(course.id)}>
            <Play size={18} /> Iniciar Entrenamiento
          </button>

          <div className="course-detail-stack">
            <section className="course-detail-card">
              <button
                type="button"
                className="course-detail-card__header"
                aria-expanded={expandedSections.has('course-info')}
                aria-controls="course-info-panel"
                onClick={() => toggleSection('course-info')}
              >
                <span>
                  <strong>Información del curso</strong>
                  <small>{lessons.length} clases • {course.duration || '0h 0m'}</small>
                </span>
                {expandedSections.has('course-info') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedSections.has('course-info') && (
                <div id="course-info-panel" className="course-detail-card__body">
                  <p>{course.description || 'Curso sin descripción registrada.'}</p>
                  <div className="course-detail-meta-grid">
                    <span><Folder size={14} /> {course.category || 'Prosperidad'}</span>
                    <span><Clock size={14} /> {course.duration || '0h 0m'}</span>
                    <span><Check size={14} /> Disponible</span>
                  </div>
                </div>
              )}
            </section>

            <section className="course-detail-card">
              <button
                type="button"
                className="course-detail-card__header"
                aria-expanded={expandedSections.has('course-structure')}
                aria-controls="course-structure-panel"
                onClick={() => toggleSection('course-structure')}
              >
                <span>
                  <strong>Estructura del curso</strong>
                  <small>Abre cada clase para ver detalles y materiales</small>
                </span>
                {expandedSections.has('course-structure') ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {expandedSections.has('course-structure') && (
                <div id="course-structure-panel" className="course-detail-card__body course-lessons-stack">
                  {lessons.length === 0 && <p className="course-detail-empty">Ninguna clase registrada todavía.</p>}
                  {lessons.map((lesson, idx) => {
                    const lessonId = lesson.id || `lesson_${idx}`;
                    const isUnlocked = daysSincePurchase >= Number(lesson.dayUnlock || 0);
                    const isLessonOpen = expandedLessons.has(lessonId);
                    const materials = Array.isArray(lesson.materials) ? lesson.materials : [];

                    return (
                      <article key={lessonId} className={`course-lesson-card ${isUnlocked ? '' : 'course-lesson-card--locked'}`}>
                        <button
                          type="button"
                          className="course-lesson-card__header"
                          aria-expanded={isLessonOpen}
                          aria-controls={`${lessonId}-panel`}
                          onClick={() => toggleLesson(lessonId)}
                        >
                          <span className="course-lesson-card__index">{String(idx + 1).padStart(2, '0')}</span>
                          <span className="course-lesson-card__title">
                            <strong>{lesson.title || 'Clase sin título'}</strong>
                            <small>{isUnlocked ? `${lesson.duration || '0m'} • Liberado` : `Se libera en el día ${lesson.dayUnlock || 0}`}</small>
                          </span>
                          <span className="course-lesson-card__icons">
                            {isUnlocked ? <Play size={15} /> : <Lock size={15} />}
                            {isLessonOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                          </span>
                        </button>

                        {isLessonOpen && (
                          <div id={`${lessonId}-panel`} className="course-lesson-card__body">
                            <p>{lesson.description || 'Sin descripción registrada.'}</p>
                            <div className="course-lesson-card__materials">
                              <strong>Materiales</strong>
                              {materials.length === 0 && <span>Ninguno</span>}
                              {materials.map((material, materialIndex) => (
                                <span key={`${lessonId}-material-${materialIndex}`}><FileText size={13} /> {material.name || `Material ${materialIndex + 1}`}</span>
                              ))}
                            </div>
                            {isUnlocked ? (
                              <button
                                type="button"
                                className="btn btn--primary course-lesson-card__play"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onOpenPlayer(course.id, lessonId);
                                }}
                              >
                                <Play size={15} /> Ver clase
                              </button>
                            ) : (
                              <div className="course-lesson-card__locked-note">Clase bloqueada hasta el día {lesson.dayUnlock || 0}.</div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
