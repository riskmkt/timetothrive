import React, { useState, useEffect, useRef } from 'react';
import { Check, Play } from 'lucide-react';
import product1 from './assets/product1.png';
import product2 from './assets/product2.png';
import product3 from './assets/product3.png';
import product4 from './assets/product4.png';
import Auth from './Auth.jsx';
import { supabase } from './src/lib/supabaseClient.js';
import TopBar from './src/components/TopBar.jsx';
import Drawer from './src/components/Drawer.jsx';
import DetailsModal from './src/components/DetailsModal.jsx';
import Toast from './src/components/Toast.jsx';
import HomePage from './src/pages/HomePage.jsx';
import PlayerPage from './src/pages/PlayerPage.jsx';
import AdminPage from './src/pages/AdminPage.jsx';
import { saveProgress, saveUserNote, loadUserData, createDebouncedSave, loadCoursesMeta, saveCoursesMeta, normalizeCoursesMeta } from './src/lib/storage.js';

const INITIAL_COURSES = [
  { id: 'course_1', title: 'La Llave del Poder', description: 'Descubre las claves ocultas de la manifestación y cómo activar la frecuencia de la abundancia en tu vida diaria.', thumbnail: product1, category: 'Manifestación', duration: '3h 45m', lessons: [
    { id: 'lesson_1_1', title: 'Clase 1: La Ciencia de la Atracción Mental', description: 'Entiende los fundamentos neurocientíficos y espirituales de la ley de la atracción.', dayUnlock: 0, duration: '25m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Guía de Activación Diaria (PDF)', url: '#' }] },
    { id: 'lesson_1_2', title: 'Clase 2: Limpiando Ruidos Mentales y Bloqueos', description: 'Técnicas prácticas para identificar pensamientos de escasez.', dayUnlock: 1, duration: '35m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Meditación Guiada de Limpieza (Audio)', url: '#' }] },
    { id: 'lesson_1_3', title: 'Clase 3: Sintonizando la Frecuencia de la Riqueza', description: 'Alinea tus emociones con la vibración de la prosperidad.', dayUnlock: 2, duration: '45m', youtubeUrl: '', localVideoUrl: '', materials: [] },
    { id: 'lesson_1_4', title: 'Clase 4: El Poder del Alineamiento Vibracional', description: 'Mantén el estado de flujo en momentos de desafío.', dayUnlock: 3, duration: '30m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Planilla de Hábitos Vibracionales', url: '#' }] },
    { id: 'lesson_1_5', title: 'Clase 5: La Llave de la Co-creación Activa', description: 'Pasos finales para materializar tus objetivos.', dayUnlock: 4, duration: '50m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'E-book: Cocreación en la Práctica (PDF)', url: '#' }] }
  ]},
  { id: 'course_2', title: 'La Llamada de los Números', description: 'Decodifica los secretos matemáticos de tu destino.', thumbnail: product2, category: 'Numerología', duration: '4h 12m', lessons: [
    { id: 'lesson_2_1', title: 'Clase 1: El Poder Invisible de los Números', description: 'Introducción a la numerología pitagórica.', dayUnlock: 0, duration: '32m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Tabla Pitagórica Completa (PDF)', url: '#' }] },
    { id: 'lesson_2_2', title: 'Clase 2: El Llamado del Número 3', description: 'Creatividad y expresión.', dayUnlock: 1, duration: '45m', youtubeUrl: '', localVideoUrl: '', materials: [] },
    { id: 'lesson_2_3', title: 'Clase 3: El Llamado del Número 5', description: 'Libertad y transformación.', dayUnlock: 2, duration: '40m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Guía de Transiciones Personales', url: '#' }] },
    { id: 'lesson_2_4', title: 'Clase 4: Calculando tu Año Personal', description: 'Aprende la fórmula para tu año personal.', dayUnlock: 3, duration: '55m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Calculadora de Año Personal (Excel)', url: '#' }] },
    { id: 'lesson_2_5', title: 'Clase 5: Sincronicidad Numérica en el Día a Día', description: 'Cómo interpretar las señales numéricas en tu cotidiano.', dayUnlock: 4, duration: '40m', youtubeUrl: '', localVideoUrl: '', materials: [] }
  ]},
  { id: 'course_3', title: 'Rituales de Prosperidad', description: 'Canaliza la energía universal con rituales ancestrales de abundancia.', thumbnail: product3, category: 'Prosperidad', duration: '2h 50m', lessons: [
    { id: 'lesson_3_1', title: 'Clase 1: Preparación del Espacio Sagrado', description: 'Aprende a crear un ambiente propicio para rituales de prosperidad.', dayUnlock: 0, duration: '30m', youtubeUrl: '', localVideoUrl: '', materials: [] },
    { id: 'lesson_3_2', title: 'Clase 2: Ritual de la Vela Dorada', description: 'Un ritual poderoso con velas para atraer abundancia.', dayUnlock: 1, duration: '35m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Lista de Materiales (PDF)', url: '#' }] },
    { id: 'lesson_3_3', title: 'Clase 3: Baño de Prosperidad', description: 'Ritual de limpieza energética para abrir caminos.', dayUnlock: 2, duration: '25m', youtubeUrl: '', localVideoUrl: '', materials: [] },
    { id: 'lesson_3_4', title: 'Clase 4: Ritual del Mapa de Abundancia', description: 'Crea tu mapa visual de prosperidad.', dayUnlock: 3, duration: '40m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Template del Mapa (PDF)', url: '#' }] },
    { id: 'lesson_3_5', title: 'Clase 5: Cierre y Gratitud', description: 'Finaliza con un ritual de agradecimiento y sellado energético.', dayUnlock: 4, duration: '20m', youtubeUrl: '', localVideoUrl: '', materials: [] }
  ]},
  { id: 'course_4', title: 'Mentalidad Millonaria', description: 'Transforma tu relación con el dinero y activa la conciencia de riqueza.', thumbnail: product4, category: 'Mentalidad', duration: '3h 20m', lessons: [
    { id: 'lesson_4_1', title: 'Clase 1: Reprogramación del Subconsciente', description: 'Elimina creencias limitantes sobre el dinero.', dayUnlock: 0, duration: '35m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Guía de Afirmaciones (PDF)', url: '#' }] },
    { id: 'lesson_4_2', title: 'Clase 2: El Flujo del Dinero', description: 'Entiende cómo fluye la energía del dinero.', dayUnlock: 1, duration: '40m', youtubeUrl: '', localVideoUrl: '', materials: [] },
    { id: 'lesson_4_3', title: 'Clase 3: Hábitos de los Prósperos', description: 'Adopta los hábitos diarios de las personas exitosas.', dayUnlock: 2, duration: '45m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Checklist de Hábitos (PDF)', url: '#' }] },
    { id: 'lesson_4_4', title: 'Clase 4: Visualización Creativa Avanzada', description: 'Técnicas avanzadas de visualización para manifestar riqueza.', dayUnlock: 3, duration: '30m', youtubeUrl: '', localVideoUrl: '', materials: [] },
    { id: 'lesson_4_5', title: 'Clase 5: Tu Plan de Acción Millonario', description: 'Crea un plan concreto para tus próximos 90 días.', dayUnlock: 4, duration: '50m', youtubeUrl: '', localVideoUrl: '', materials: [{ name: 'Plan 90 Días (PDF)', url: '#' }] }
  ]}
];

const ADMIN_EMAIL = 'icaroxzm@gmail.com';

const debouncedNoteSave = createDebouncedSave(1500);

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [view, setView] = useState('home');
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [completed, setCompleted] = useState({});
  const [notes, setNotes] = useState({});
  const [playerTab, setPlayerTab] = useState('description');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailsCourse, setDetailsCourse] = useState(null);
  const [toast, setToast] = useState(null);
  const [daysSincePurchase] = useState(999); // Default: all lessons unlocked

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  // ─── Auth listener ───
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ─── Load courses from Supabase (Problema 1 fix) ───
  useEffect(() => {
    if (!session) return;
    (async () => {
      try {
        const remoteCourses = await loadCoursesMeta();
        if (remoteCourses && remoteCourses.length > 0) {
          // Merge thumbnails from INITIAL_COURSES (images are local imports, not serializable)
          const merged = normalizeCoursesMeta(remoteCourses).map(rc => {
            const initial = INITIAL_COURSES.find(ic => ic.id === rc.id);
            return { ...rc, thumbnail: initial?.thumbnail || rc.thumbnail };
          });
          setCourses(merged);
        }
      } catch (err) {
        console.error('Error loading courses from Supabase:', err);
      }
    })();
  }, [session]);

  // ─── Load user progress & notes ───
  useEffect(() => {
    if (!session) return;
    const loader = loadUserData(session, setCompleted, setNotes);
    loader().then(result => {
      if (result) {
        setCompleted(result.completed || {});
        setNotes(result.notes || {});
      }
    });
  }, [session]);

  // ─── Handlers ───
  const toggleCompleted = async (lessonId) => {
    const newVal = !completed[lessonId];
    setCompleted(prev => ({ ...prev, [lessonId]: newVal }));
    await saveProgress(session, lessonId, activeCourseId, newVal);
    showToast(newVal ? '✅ Clase completada' : 'Clase desmarcada');
  };

  const saveNote = async (lessonId, text) => {
    setNotes(prev => ({ ...prev, [lessonId]: text }));
    debouncedNoteSave(() => saveUserNote(session, lessonId, activeCourseId, text));
  };

  const saveToStorage = async (key, data) => {
    if (key === 'courses_meta') {
      try {
        const result = await saveCoursesMeta(data);
        showToast(result?.cloudSaved ? '✅ Cambios guardados en la nube' : '✅ Cambios guardados en este navegador');
      } catch (err) {
        console.error('Error saving courses:', err);
        showToast('❌ Error al guardar');
      }
    }
  };

  const openPlayer = (courseId, lessonId) => {
    setActiveCourseId(courseId);
    const course = courses.find(c => c.id === courseId);
    const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
    setActiveLessonId(lessonId || lessons[0]?.id || null);
    setPlayerTab('description');
    setView('player');
  };

  const navigateLesson = (direction) => {
    const course = courses.find(c => c.id === activeCourseId);
    if (!course) return;
    const lessons = Array.isArray(course.lessons) ? course.lessons : [];
    const currentIdx = lessons.findIndex(l => l.id === activeLessonId);
    const newIdx = currentIdx + direction;
    if (newIdx >= 0 && newIdx < lessons.length) {
      setActiveLessonId(lessons[newIdx].id);
      setPlayerTab('description');
    }
  };

  // ─── Auth guard ───
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', color: 'var(--text)' }}>Cargando...</div>;
  if (!session) return <Auth onLogin={() => {}} />;

  const isAdmin = session?.user?.email === ADMIN_EMAIL;
  const activeCourse = courses.find(c => c.id === activeCourseId);
  const activeLessons = Array.isArray(activeCourse?.lessons) ? activeCourse.lessons : [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        view={view}
        setView={setView}
        title={activeCourse?.title}
        subtitle={activeLessons.find(l => l.id === activeLessonId)?.title}
        onOpenDrawer={() => setDrawerOpen(true)}
        session={session}
        isAdmin={isAdmin}
      />

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        session={session}
        view={view}
        onNavigate={(v) => setView(v)}
      />

      {detailsCourse && (
        <DetailsModal
          course={detailsCourse}
          daysSincePurchase={daysSincePurchase}
          onClose={() => setDetailsCourse(null)}
          onOpenPlayer={(courseId, lessonId) => { setDetailsCourse(null); openPlayer(courseId, lessonId); }}
        />
      )}

      {view === 'home' && (
        <HomePage
          courses={courses}
          loading={false}
          onOpenPlayer={openPlayer}
          onShowDetails={(course) => setDetailsCourse(course)}
        />
      )}

      {view === 'player' && activeCourse && (
        <PlayerPage
          course={activeCourse}
          activeLessonId={activeLessonId}
          setActiveLessonId={setActiveLessonId}
          completed={completed}
          toggleCompleted={toggleCompleted}
          notes={notes}
          saveNote={saveNote}
          playerTab={playerTab}
          setPlayerTab={setPlayerTab}
          daysSincePurchase={daysSincePurchase}
          navigateLesson={navigateLesson}
          session={session}
          activeCourseId={activeCourseId}
        />
      )}

      {view === 'admin' && isAdmin && (
        <AdminPage
          courses={courses}
          setCourses={setCourses}
          setView={setView}
          saveToStorage={saveToStorage}
        />
      )}

      {view === 'admin' && !isAdmin && (
        <HomePage
          courses={courses}
          loading={false}
          onOpenPlayer={openPlayer}
          onShowDetails={(course) => setDetailsCourse(course)}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}
