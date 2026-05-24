import React, { useRef, useState } from 'react';
import { ChevronLeft, Folder, Upload, Plus, Trash2, FileText, X, Check, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';
import { createDebouncedSave } from '../lib/storage.js';
import { parseYouTubeUrl } from '../lib/youtube.js';
import { getCourseDuration, withComputedCourseDurations } from '../lib/duration.js';

const emptyLessonDraft = { title: '', description: '', dayUnlock: 0, duration: '15m' };

export default function AdminPage({ courses, setCourses, setView, saveToStorage, coursesCloudStatus }) {
  const videoInputRef = useRef(null);
  const materialInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const debouncedSaveRef = useRef(createDebouncedSave(900));
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [lessonDrafts, setLessonDrafts] = useState({});
  const [toast, setToast] = useState(null);
  const [expandedLessons, setExpandedLessons] = useState(new Set());

  const courseList = Array.isArray(courses) ? courses : [];
  const isCloudReady = coursesCloudStatus?.cloudReady === true;
  const isCheckingCloud = coursesCloudStatus?.cloudReady == null;
  const getLessons = (course) => Array.isArray(course?.lessons) ? course.lessons : [];
  const getDraft = (courseId) => lessonDrafts[courseId] || emptyLessonDraft;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const updateDraft = (courseId, patch) => {
    setLessonDrafts(prev => ({
      ...prev,
      [courseId]: { ...(prev[courseId] || emptyLessonDraft), ...patch },
    }));
  };

  const updateCourses = (updated, { immediate = false } = {}) => {
    const computed = withComputedCourseDurations(updated);
    setCourses(computed);
    if (immediate) {
      saveToStorage('courses_meta', computed);
      return;
    }
    debouncedSaveRef.current(() => saveToStorage('courses_meta', computed));
  };

  const toggleAccordion = (lessonId) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) next.delete(lessonId);
      else next.add(lessonId);
      return next;
    });
  };

  const updateLesson = (courseId, lessonId, patch, options) => {
    updateCourses(courseList.map(course => course.id === courseId ? {
      ...course,
      lessons: getLessons(course).map(lesson => lesson.id === lessonId ? { ...lesson, ...patch } : lesson),
    } : course), options);
  };

  const handleVideoUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingLessonId || !editingCourseId) return;

    const url = URL.createObjectURL(file);
    updateLesson(editingCourseId, editingLessonId, { localVideoUrl: url, youtubeUrl: '' }, { immediate: true });
    showToast('Video añadido para esta sesión');
  };

  const handleMaterialUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingLessonId || !editingCourseId) return;

    const url = URL.createObjectURL(file);
    updateCourses(courseList.map(course => course.id === editingCourseId ? {
      ...course,
      lessons: getLessons(course).map(lesson => {
        const materials = Array.isArray(lesson.materials) ? lesson.materials : [];
        return lesson.id === editingLessonId
          ? { ...lesson, materials: [...materials, { name: file.name, url, transient: true }] }
          : lesson;
      }),
    } : course), { immediate: true });
    showToast('Material añadido para esta sesión');
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !editingCourseId) return;
    if (!file.type.startsWith('image/')) return showToast('Selecciona una imagen válida');
    if (file.size > 2 * 1024 * 1024) return showToast('Imagen muy pesada. Usa hasta 2MB');

    const reader = new FileReader();
    reader.onload = () => {
      updateCourses(courseList.map(course => course.id === editingCourseId ? {
        ...course,
        thumbnail: String(reader.result || ''),
      } : course), { immediate: true });
      showToast('Capa del curso actualizada');
    };
    reader.onerror = () => showToast('No fue posible leer la imagen');
    reader.readAsDataURL(file);
  };

  const deleteMaterial = (courseId, lessonId, idx) => {
    updateCourses(courseList.map(course => course.id === courseId ? {
      ...course,
      lessons: getLessons(course).map(lesson => {
        const materials = Array.isArray(lesson.materials) ? lesson.materials : [];
        return lesson.id === lessonId ? { ...lesson, materials: materials.filter((_, i) => i !== idx) } : lesson;
      }),
    } : course), { immediate: true });
    showToast('Material eliminado');
  };

  const deleteLesson = (courseId, lessonId) => {
    if (!confirm('Eliminar esta clase?')) return;
    updateCourses(courseList.map(course => course.id === courseId ? {
      ...course,
      lessons: getLessons(course).filter(lesson => lesson.id !== lessonId),
    } : course), { immediate: true });
    showToast('Clase eliminada');
  };

  const deleteCourse = (courseId) => {
    if (!confirm('Eliminar ESTE CURSO COMPLETO?')) return;
    updateCourses(courseList.filter(course => course.id !== courseId), { immediate: true });
    showToast('Curso eliminado');
  };

  const createCourse = () => {
    const title = newCourseTitle.trim();
    if (!title) return showToast('Título obligatorio');

    updateCourses([...courseList, {
      id: `course_${Date.now()}`,
      title,
      description: 'Descripción del curso.',
      thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=600',
      category: 'Prosperidad',
      duration: '1h 00m',
      lessons: [],
    }], { immediate: true });
    setNewCourseTitle('');
    showToast('Curso creado');
  };

  const createLesson = (courseId) => {
    const draft = getDraft(courseId);
    const title = draft.title.trim();
    if (!title) return showToast('Título obligatorio');

    const lesson = {
      id: `lesson_${Date.now()}`,
      title,
      description: draft.description.trim() || 'Sin descripción.',
      dayUnlock: Number.isFinite(Number(draft.dayUnlock)) ? Number(draft.dayUnlock) : 0,
      duration: draft.duration.trim() || '15m',
      youtubeUrl: '',
      localVideoUrl: '',
      materials: [],
    };

    updateCourses(courseList.map(course => course.id === courseId ? {
      ...course,
      lessons: [...getLessons(course), lesson],
    } : course), { immediate: true });

    setLessonDrafts(prev => ({ ...prev, [courseId]: emptyLessonDraft }));
    setExpandedLessons(prev => new Set(prev).add(lesson.id));
    showToast('Clase añadida');
  };

  const updateLessonVideoUrl = (courseId, lessonId, raw) => {
    const parsed = parseYouTubeUrl(raw);
    updateLesson(courseId, lessonId, {
      youtubeUrl: parsed ? parsed.embedUrl : raw,
      localVideoUrl: '',
    });
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <span className="admin-eyebrow">Administración</span>
          <h1>Gestión de Contenido</h1>
        </div>
        <button className="btn btn--ghost admin-back-btn" onClick={() => setView('home')}>
          <ChevronLeft size={16} /> Volver al Inicio
        </button>
      </div>

      <input type="file" accept="video/mp4,video/webm" ref={videoInputRef} style={{ display: 'none' }} onChange={handleVideoUpload} />
      <input type="file" accept=".pdf,.doc,.docx,.zip,.mp3" ref={materialInputRef} style={{ display: 'none' }} onChange={handleMaterialUpload} />
      <input type="file" accept="image/png,image/jpeg,image/webp" ref={coverInputRef} style={{ display: 'none' }} onChange={handleCoverUpload} />

      <section className={`admin-cloud-status ${isCloudReady ? 'admin-cloud-status--ready' : ''} ${isCheckingCloud ? 'admin-cloud-status--checking' : 'admin-cloud-status--local'}`}>
        <div>
          <span className="admin-eyebrow">{isCloudReady ? 'PUBLICACIÓN GLOBAL' : isCheckingCloud ? 'VALIDANDO PUBLICACIÓN' : 'MODO LOCAL'}</span>
          <strong>{isCloudReady ? 'Los cambios se guardan para todos los alumnos.' : isCheckingCloud ? 'Comprobando conexión con Supabase.' : 'Tus cambios todavía no aparecen para otros usuarios.'}</strong>
          <p>{coursesCloudStatus?.message || 'Validando conexión con Supabase...'}</p>
        </div>
      </section>

      <section className="desc-card admin-create-card">
        <h3>+ Crear Nuevo Entrenamiento</h3>
        <div className="admin-create-row">
          <input
            placeholder="Nombre del nuevo curso..."
            value={newCourseTitle}
            onChange={event => setNewCourseTitle(event.target.value)}
          />
          <button className="btn btn--primary" onClick={createCourse}>Crear Curso</button>
        </div>
      </section>

      {courseList.map(course => {
        const lessons = getLessons(course);
        const draft = getDraft(course.id);
        const courseDuration = getCourseDuration(course);

        return (
          <section key={course.id} className="desc-card admin-course-card">
            <div className="admin-course-header">
              <div className="admin-course-title-field">
                <span className="admin-eyebrow">EDITANDO CURSO</span>
                <input
                  value={course.title || ''}
                  onChange={event => updateCourses(courseList.map(item => item.id === course.id ? { ...item, title: event.target.value } : item))}
                />
              </div>
              <button className="btn btn--ghost admin-danger-btn" onClick={() => deleteCourse(course.id)}>
                <Trash2 size={16} /> Eliminar Curso
              </button>
            </div>

            <div className="admin-course-body">
              <div className="admin-cover-editor">
                <div className="admin-cover-editor__preview">
                  {course.thumbnail ? <img src={course.thumbnail} alt={`Capa de ${course.title || 'curso'}`} /> : <ImageIcon size={28} />}
                </div>
                <div className="admin-cover-editor__fields">
                  <span className="admin-eyebrow">CAPA E DURACIÓN</span>
                  <label className="admin-cover-url">
                    <span>URL de la capa</span>
                    <input
                      value={typeof course.thumbnail === 'string' ? course.thumbnail : ''}
                      onChange={event => updateCourses(courseList.map(item => item.id === course.id ? { ...item, thumbnail: event.target.value } : item))}
                      placeholder="https://..."
                    />
                  </label>
                  <div className="admin-cover-editor__meta">
                    <span>{courseDuration}</span>
                    <button type="button" className="btn btn--ghost" onClick={() => { setEditingCourseId(course.id); coverInputRef.current?.click(); }}>
                      <Upload size={14} /> Subir Capa
                    </button>
                  </div>
                </div>
              </div>

              <h3 className="admin-section-title">
                <Folder size={16} color="var(--accent)" /> Clases ({lessons.length})
              </h3>

              {lessons.map(lesson => {
                const isOpen = expandedLessons.has(lesson.id);
                const lessonYoutubeUrl = typeof lesson.youtubeUrl === 'string' ? lesson.youtubeUrl : '';
                const lessonMaterials = Array.isArray(lesson.materials) ? lesson.materials : [];

                return (
                  <div key={lesson.id} className={`lesson-accordion ${isOpen ? 'lesson-accordion--open' : ''}`}>
                    <button type="button" className="lesson-accordion__header" onClick={() => toggleAccordion(lesson.id)}>
                      <span className="lesson-accordion__title">
                        <span>{lesson.title || 'Sin título'}</span>
                        <span className="lesson-accordion__duration">({lesson.duration || '0m'})</span>
                      </span>
                      <span className="lesson-accordion__meta">
                        <span>Día {Number.isFinite(Number(lesson.dayUnlock)) ? Number(lesson.dayUnlock) : 0}</span>
                        {isOpen ? <ChevronUp size={18} color="var(--text2)" /> : <ChevronDown size={18} color="var(--text2)" />}
                      </span>
                    </button>

                    <div className="lesson-accordion__body">
                      <div className="lesson-accordion__content">
                        <div className="admin-lesson-fields">
                          <input
                            value={lesson.title || ''}
                            onChange={event => updateLesson(course.id, lesson.id, { title: event.target.value })}
                            placeholder="Título de la clase"
                          />
                          <textarea
                            value={lesson.description || ''}
                            onChange={event => updateLesson(course.id, lesson.id, { description: event.target.value })}
                            placeholder="Descripción..."
                          />

                          <div className="admin-lesson-inline">
                            <label>
                              <span>Día liberación</span>
                              <input
                                type="number"
                                value={Number.isFinite(Number(lesson.dayUnlock)) ? Number(lesson.dayUnlock) : 0}
                                onChange={event => updateLesson(course.id, lesson.id, { dayUnlock: Number(event.target.value) })}
                              />
                            </label>
                            <label>
                              <span>Duración</span>
                              <input
                                type="text"
                                value={lesson.duration || '15m'}
                                onChange={event => updateLesson(course.id, lesson.id, { duration: event.target.value })}
                                placeholder="25m"
                              />
                            </label>
                            <label className="admin-url-field">
                              <span>YouTube URL</span>
                              <input
                                type="text"
                                value={lessonYoutubeUrl}
                                onChange={event => updateLessonVideoUrl(course.id, lesson.id, event.target.value)}
                                placeholder="URL o ID del video"
                              />
                              {lessonYoutubeUrl.includes('/embed/') && <strong><Check size={12} /> OK</strong>}
                            </label>
                          </div>

                          <div className="admin-materials">
                            <div className="admin-materials__title">Materiales:</div>
                            {lessonMaterials.length === 0 && <div className="admin-empty">Ninguno</div>}
                            {lessonMaterials.map((mat, idx) => {
                              const hasPersistentUrl = mat.url && !mat.url.startsWith('blob:');
                              return (
                                <div key={`${mat.name}-${idx}`} className="admin-material-item">
                                  <span><FileText size={12} color="var(--accent)" /> {mat.name || `Material ${idx + 1}`}</span>
                                  {!hasPersistentUrl && <small>Sesión</small>}
                                  <button type="button" aria-label={`Eliminar ${mat.name || 'material'}`} onClick={() => deleteMaterial(course.id, lesson.id, idx)}>
                                    <X size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="admin-lesson-actions">
                          <button className="btn btn--ghost" onClick={() => { setEditingCourseId(course.id); setEditingLessonId(lesson.id); videoInputRef.current?.click(); }}>
                            <Upload size={14} /> Subir Video
                          </button>
                          <button className="btn btn--ghost" onClick={() => { setEditingCourseId(course.id); setEditingLessonId(lesson.id); materialInputRef.current?.click(); }}>
                            <Plus size={14} /> Material
                          </button>
                          <button className="btn btn--ghost admin-danger-btn" onClick={() => deleteLesson(course.id, lesson.id)}>
                            <Trash2 size={14} /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="admin-add-lesson">
                <h4>+ Añadir Clase</h4>
                <div className="admin-add-lesson__grid">
                  <input
                    placeholder="Título..."
                    value={draft.title}
                    onChange={event => updateDraft(course.id, { title: event.target.value })}
                  />
                  <input
                    placeholder="Descripción..."
                    value={draft.description}
                    onChange={event => updateDraft(course.id, { description: event.target.value })}
                  />
                  <label>
                    <span>Día</span>
                    <input
                      type="number"
                      value={draft.dayUnlock}
                      onChange={event => updateDraft(course.id, { dayUnlock: event.target.value })}
                    />
                  </label>
                  <label>
                    <span>Duración</span>
                    <input
                      type="text"
                      value={draft.duration}
                      onChange={event => updateDraft(course.id, { duration: event.target.value })}
                      placeholder="15m"
                    />
                  </label>
                  <button className="btn btn--primary" onClick={() => createLesson(course.id)}>
                    <Plus size={16} /> Crear
                  </button>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
