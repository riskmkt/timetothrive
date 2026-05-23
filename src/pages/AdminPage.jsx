import React, { useRef, useState } from 'react';
import { ChevronLeft, Folder, Upload, Plus, Trash2, FileText, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { parseYouTubeUrl } from '../lib/youtube.js';

export default function AdminPage({ courses, setCourses, setView, saveToStorage }) {
  const videoInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDay, setNewDay] = useState(0);
  const [toast, setToast] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState(new Set());

  const toggleAccordion = (lessonId) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const updateCourses = (updated) => { setCourses(updated); saveToStorage('courses_meta', updated); };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file && editingLessonId && editingCourseId) {
      const url = URL.createObjectURL(file);
      updateCourses(courses.map(c => c.id === editingCourseId ? { ...c, lessons: c.lessons.map(l => l.id === editingLessonId ? { ...l, localVideoUrl: url, youtubeUrl: '' } : l) } : c));
      showToast('Video subido');
    }
  };

  const handleMaterialUpload = (e) => {
    const file = e.target.files[0];
    if (file && editingLessonId && editingCourseId) {
      const url = URL.createObjectURL(file);
      updateCourses(courses.map(c => c.id === editingCourseId ? { ...c, lessons: c.lessons.map(l => l.id === editingLessonId ? { ...l, materials: [...(l.materials || []), { name: file.name, url }] } : l) } : c));
      showToast('Material añadido');
    }
  };

  const deleteMaterial = (courseId, lessonId, idx) => {
    updateCourses(courses.map(c => c.id === courseId ? { ...c, lessons: (c.lessons || []).map(l => l.id === lessonId ? { ...l, materials: (l.materials || []).filter((_, i) => i !== idx) } : l) } : c));
    showToast('Material eliminado');
  };

  const deleteLesson = (courseId, lessonId) => {
    if (confirm('Eliminar esta clase?')) {
      updateCourses(courses.map(c => c.id === courseId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c));
      showToast('Clase eliminada');
    }
  };

  const deleteCourse = (courseId) => {
    if (confirm('Eliminar ESTE CURSO COMPLETO?')) {
      updateCourses(courses.filter(c => c.id !== courseId));
      showToast('Curso eliminado');
    }
  };

  const createCourse = () => {
    if (!newCourseTitle) return showToast('Título obligatorio');
    updateCourses([...courses, { id: 'course_' + Date.now(), title: newCourseTitle, description: 'Descripción del curso.', thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600', category: 'Prosperidad', duration: '0h 0m', lessons: [] }]);
    setNewCourseTitle('');
    showToast('Curso creado');
  };

  const createLesson = (courseId) => {
    if (!newTitle) return showToast('Título obligatorio');
    updateCourses(courses.map(c => c.id === courseId ? { ...c, lessons: [...(c.lessons || []), { id: 'lesson_' + Date.now(), title: newTitle, description: newDesc || 'Sin descripción.', dayUnlock: Number(newDay), duration: '15m', youtubeUrl: '', localVideoUrl: '', materials: [] }] } : c));
    setNewTitle(''); setNewDesc(''); setNewDay(0);
    showToast('Clase añadida');
  };

  const updateLessonVideoUrl = (courseId, lessonId, raw) => {
    const parsed = parseYouTubeUrl(raw);
    const youtubeUrl = parsed ? parsed.embedUrl : raw;
    updateCourses(courses.map(c => c.id === courseId ? {
      ...c,
      lessons: (c.lessons || []).map(l => l.id === lessonId ? { ...l, youtubeUrl, localVideoUrl: '' } : l),
    } : c));
  };

  return (
    <div style={{ padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Administración</span>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>Gestión de Contenido</h1>
        </div>
        <button className="btn btn--ghost" style={{ width: 'auto', padding: '0.6rem 1.25rem' }} onClick={() => setView('home')}><ChevronLeft size={16} /> Volver al Inicio</button>
      </div>

      <input type="file" accept="video/mp4,video/webm" ref={videoInputRef} style={{ display: 'none' }} onChange={handleVideoUpload} />
      <input type="file" accept=".pdf,.doc,.docx,.zip,.mp3" ref={materialInputRef} style={{ display: 'none' }} onChange={handleMaterialUpload} />

      <div className="desc-card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '1rem' }}>+ Crear Nuevo Entrenamiento</h3>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input placeholder="Nombre del nuevo curso..." value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.75rem 1rem', color: 'white', borderRadius: 'var(--radius-sm)', outline: 'none' }} />
          <button className="btn btn--primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }} onClick={createCourse}>Crear Curso</button>
        </div>
      </div>

      {courses.map(course => (
        <div key={course.id} className="desc-card" style={{ marginBottom: '2.5rem', border: '1px solid var(--border)', padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 'bold' }}>EDITANDO CURSO</span>
              <input value={course.title} onChange={e => updateCourses(courses.map(c => c.id === course.id ? { ...c, title: e.target.value } : c))} style={{ background: 'transparent', border: 'none', borderBottom: '1px dashed var(--border)', padding: '4px 0', color: 'white', fontWeight: 800, fontSize: '1.25rem', width: '100%', outline: 'none' }} />
            </div>
            <button className="btn btn--ghost" style={{ width: 'auto', color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={() => deleteCourse(course.id)}><Trash2 size={16} /> Eliminar Curso</button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text2)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Folder size={16} color="var(--accent)" /> Clases ({course.lessons.length})</h3>
            {(course.lessons || []).map(lesson => {
              const isOpen = expandedLessons.has(lesson.id);
              const lessonYoutubeUrl = typeof lesson.youtubeUrl === 'string' ? lesson.youtubeUrl : '';
              return (
              <div key={lesson.id} className={`lesson-accordion ${isOpen ? 'lesson-accordion--open' : ''}`}>
                <div className="lesson-accordion__header" onClick={() => toggleAccordion(lesson.id)}>
                  <div className="lesson-accordion__title">
                    <span>{lesson.title || 'Sin título'}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text3)' }}>({lesson.duration || '0m'})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Día {lesson.dayUnlock}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--text2)" /> : <ChevronDown size={18} color="var(--text2)" />}
                  </div>
                </div>
                <div className="lesson-accordion__body">
                  <div className="lesson-accordion__content">
                    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <input value={lesson.title} onChange={e => updateCourses(courses.map(c => c.id === course.id ? { ...c, lessons: c.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l) } : c))} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '0.6rem 0.85rem', color: 'white', borderRadius: '6px', fontWeight: 'bold', outline: 'none' }} />
                      <textarea value={lesson.description} onChange={e => updateCourses(courses.map(c => c.id === course.id ? { ...c, lessons: c.lessons.map(l => l.id === lesson.id ? { ...l, description: e.target.value } : l) } : c))} placeholder="Descripción..." style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', padding: '0.6rem 0.85rem', color: 'var(--text2)', borderRadius: '6px', minHeight: '60px', outline: 'none', resize: 'vertical' }} />
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          Día liberación: <input type="number" value={lesson.dayUnlock} onChange={e => updateCourses(courses.map(c => c.id === course.id ? { ...c, lessons: c.lessons.map(l => l.id === lesson.id ? { ...l, dayUnlock: Number(e.target.value) } : l) } : c))} style={{ width: '60px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', padding: '4px 8px', borderRadius: '4px', outline: 'none' }} />
                        </label>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                          YouTube URL: <input type="text" value={lessonYoutubeUrl} onChange={e => updateLessonVideoUrl(course.id, lesson.id, e.target.value)} placeholder="URL o ID del video" style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', padding: '4px 8px', borderRadius: '4px', outline: 'none' }} />
                          {lessonYoutubeUrl.includes('/embed/') && <span style={{ color: 'var(--green)', fontSize: '0.7rem' }}><Check size={12} /> OK</span>}
                        </label>
                      </div>
                      <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--text2)', marginBottom: '0.5rem' }}>Materiales:</div>
                        {(!lesson.materials || lesson.materials.length === 0) && <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Ninguno</div>}
                        {lesson.materials?.map((mat, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', background: 'rgba(255,255,255,0.02)', padding: '4px 8px', borderRadius: '4px', marginBottom: '4px' }}>
                            <span><FileText size={12} color="var(--accent)" /> {mat.name}</span>
                            <button style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer' }} onClick={() => deleteMaterial(course.id, lesson.id, idx)}><X size={14} /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '150px' }}>
                      <button className="btn btn--ghost" style={{ height: '34px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setEditingCourseId(course.id); setEditingLessonId(lesson.id); videoInputRef.current.click(); }}><Upload size={14} /> Subir Video</button>
                      <button className="btn btn--ghost" style={{ height: '34px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); setEditingCourseId(course.id); setEditingLessonId(lesson.id); materialInputRef.current.click(); }}><Plus size={14} /> Material</button>
                      <button className="btn btn--ghost" style={{ height: '34px', fontSize: '0.75rem', color: '#EF4444', borderColor: 'rgba(239,68,68,0.2)' }} onClick={(e) => { e.stopPropagation(); deleteLesson(course.id, lesson.id); }}><Trash2 size={14} /> Eliminar</button>
                    </div>
                  </div>
                </div>
              </div>
            );})}
            <div style={{ marginTop: '1.5rem', padding: '1.25rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.75rem' }}>+ Añadir Clase</h4>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <input placeholder="Título..." value={newTitle} onChange={e => setNewTitle(e.target.value)} style={{ flex: 1, minWidth: '200px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', padding: '0.6rem 0.85rem', color: 'white', borderRadius: '6px', outline: 'none' }} />
                <label style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Día: <input type="number" value={newDay} onChange={e => setNewDay(e.target.value)} style={{ width: '50px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'white', padding: '6px 8px', borderRadius: '4px', outline: 'none' }} /></label>
                <button className="btn btn--primary" style={{ width: 'auto', padding: '0.6rem 1.25rem' }} onClick={() => createLesson(course.id)}>Crear</button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
