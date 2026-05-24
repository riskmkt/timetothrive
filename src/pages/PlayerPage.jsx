import React from 'react';
import { Video, Check, ChevronLeft, ChevronRight, FileText, Lock } from 'lucide-react';
import { parseYouTubeUrl } from '../lib/youtube.js';

export default function PlayerPage({ course, activeLessonId, setActiveLessonId, completed, toggleCompleted, notes, saveNote, playerTab, setPlayerTab, daysSincePurchase, navigateLesson }) {
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const activeLesson = lessons.find(l => l.id === activeLessonId) || lessons[0];
  const materials = Array.isArray(activeLesson?.materials) ? activeLesson.materials : [];
  const currentIndex = lessons.findIndex(l => l.id === activeLesson?.id);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === lessons.length - 1;
  const completedCount = lessons.filter(l => completed[l.id]).length;
  const progress = Math.round((completedCount / lessons.length) * 100) || 0;

  if (!activeLesson) {
    return (
      <div className="lesson-page lesson-page--empty">
        <main className="content">
          <div className="desc-card">
            <h3>{course?.title || 'Curso sin título'}</h3>
            <p>Este curso todavía no tiene clases publicadas. Añade clases en el panel administrativo para liberar el contenido.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="lesson-page">
      <aside className="sidebar">
        <h2 className="sidebar__title">{course?.title || 'Curso sin título'}</h2>
        <p className="sidebar__subtitle">{course?.category || 'Membros'}</p>
        <div className="sidebar__progress-header">
          <span className="sidebar__progress-label">Progresso</span>
          <span className="sidebar__progress-val">{progress}%</span>
        </div>
        <div className="sidebar__progress-bar">
          <div className="sidebar__progress-fill" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="sidebar__progress-count">{completedCount} de {lessons.length} clases completadas</div>
        <div className="module">
          <div className="module__title">Contenido del Curso</div>
          {lessons.map((lesson, idx) => {
            const isLessonActive = lesson.id === activeLesson.id;
            const isLessonCompleted = completed[lesson.id];
            const isLessonLocked = daysSincePurchase < lesson.dayUnlock;
            return (
              <button key={lesson.id} type="button" className={`lesson-item ${isLessonActive ? 'lesson-item--active' : ''} ${isLessonCompleted ? 'lesson-item--completed' : ''}`} disabled={isLessonLocked} style={{ opacity: isLessonLocked ? 0.6 : 1 }} onClick={() => setActiveLessonId(lesson.id)}>
                <div className="lesson-item__icon">
                  {isLessonCompleted ? <Check size={12} color="white" /> : isLessonLocked ? <Lock size={12} /> : <span>{idx + 1}</span>}
                </div>
                <span className="lesson-item__text">{lesson.title}</span>
                {isLessonLocked && <span className="lesson-item__badge">D{lesson.dayUnlock}</span>}
              </button>
            );
          })}
        </div>
      </aside>
      <main className="content player-content">
        <div className="player-lesson-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Clase {currentIndex + 1}</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', marginTop: '0.25rem' }}>{activeLesson?.title}</h2>
          </div>
          <button className={`btn ${completed[activeLesson?.id] ? 'btn--primary' : 'btn--ghost'}`} onClick={() => toggleCompleted(activeLesson.id)} style={{ width: 'auto', padding: '0.5rem 1.25rem', borderRadius: '30px' }}>
            {completed[activeLesson?.id] && <Check size={16} />}
            {completed[activeLesson?.id] ? 'Completada ✓' : 'Marcar como Completada'}
          </button>
        </div>
        <div className="player">
          {(() => {
            const ytInfo = parseYouTubeUrl(activeLesson?.youtubeUrl);
            if (ytInfo) return <iframe src={`${ytInfo.embedUrl}?enablejsapi=1&rel=0`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={activeLesson.title} />;
            if (activeLesson?.localVideoUrl) return <video src={activeLesson.localVideoUrl} controls />;
            return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', background: '#0a0c14' }}><Video size={48} style={{ marginBottom: 16, opacity: 0.5 }} /><div>Video procesándose o no disponible</div></div>;
          })()}
        </div>
        <div className="player__actions" style={{ display: 'flex', justifyContent: 'space-between', margin: '1rem 0 2rem 0' }}>
          <button className="btn btn--ghost" onClick={() => navigateLesson(-1)} disabled={isFirst} style={{ width: 'auto', padding: '0.5rem 1.25rem', opacity: isFirst ? 0.4 : 1 }}><ChevronLeft size={16} /> Anterior</button>
          <button className="btn btn--ghost" onClick={() => navigateLesson(1)} disabled={isLast} style={{ width: 'auto', padding: '0.5rem 1.25rem', opacity: isLast ? 0.4 : 1 }}>Siguiente <ChevronRight size={16} /></button>
        </div>
        <div className="tabs">
          {['description', 'materials', 'notes'].map(tab => (
            <button key={tab} className={`tab-btn ${playerTab === tab ? 'tab-btn--active' : ''}`} onClick={() => setPlayerTab(tab)}>
              {tab === 'description' ? 'Descripción' : tab === 'materials' ? `Materiales (${materials.length})` : 'Notas'}
            </button>
          ))}
        </div>
        <div style={{ marginTop: '1rem' }}>
          <div className={`tab-panel ${playerTab === 'description' ? 'tab-panel--active' : ''}`}>
            <div className="desc-card"><h3>Sobre el contenido</h3><p style={{ lineHeight: '1.6', marginTop: '0.5rem' }}>{activeLesson?.description}</p></div>
          </div>
          <div className={`tab-panel ${playerTab === 'materials' ? 'tab-panel--active' : ''}`}>
            <div className="materials">
              <div className="materials__title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}><FileText size={20} color="var(--accent)" /><span>Materiales para Descargar</span></div>
              {materials.length === 0 ? <p style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Ningún material de apoyo adjunto a esta clase.</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {materials.map((mat, idx) => {
                    const hasUrl = mat.url && mat.url !== '#' && !mat.url.startsWith('blob:');
                    return hasUrl ? (
                      <a key={idx} href={mat.url} target="_blank" rel="noopener noreferrer" className="material-item">
                        <FileText size={18} /><span>{mat.name}</span><ChevronRight size={16} />
                      </a>
                    ) : (
                      <div key={idx} className="material-item material-item--disabled" aria-disabled="true">
                        <FileText size={18} /><span>{mat.name}</span><span>En breve</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className={`tab-panel ${playerTab === 'notes' ? 'tab-panel--active' : ''}`}>
            <div className="notes-area">
              <textarea value={notes[activeLesson?.id] || ''} onChange={(e) => saveNote(activeLesson?.id, e.target.value)} placeholder="Registra aquí tus insights, aprendizajes y dudas. Tus notas se guardan automáticamente..." />
              <div className="notes-area__save" style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontSize: '0.75rem', color: 'var(--text3)', marginTop: '0.5rem' }}><Check size={12} color="var(--green)" /> Notas guardadas en tiempo real</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
