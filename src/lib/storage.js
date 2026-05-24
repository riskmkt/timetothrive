import { supabase } from './supabaseClient.js';

const COURSES_META_STORAGE_KEY = 'timetothrive:courses_meta';
export const COURSES_META_TABLE_SQL_PATH = 'supabase/courses_meta.sql';

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadLocalCoursesMeta() {
  if (!canUseLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(COURSES_META_STORAGE_KEY);
    return raw ? normalizeCoursesMeta(JSON.parse(raw)) : null;
  } catch (err) {
    console.error('Error loading local courses_meta:', err);
    return null;
  }
}

function saveLocalCoursesMeta(courses) {
  if (!canUseLocalStorage()) return false;
  try {
    window.localStorage.setItem(COURSES_META_STORAGE_KEY, JSON.stringify(courses));
    return true;
  } catch (err) {
    console.error('Error saving local courses_meta:', err);
    return false;
  }
}

function isTransientUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:');
}

function sanitizeCoursesForPersistence(courses) {
  return normalizeCoursesMeta(courses).map(course => ({
    ...course,
    thumbnail: typeof course.thumbnail === 'string' ? course.thumbnail : '',
    lessons: course.lessons.map(lesson => ({
      ...lesson,
      localVideoUrl: isTransientUrl(lesson.localVideoUrl) ? '' : lesson.localVideoUrl,
      materials: lesson.materials.map(material => ({
        ...material,
        url: isTransientUrl(material.url) ? '' : material.url,
      })),
    })),
  }));
}

function logCoursesMetaFallback(context, err) {
  const code = err?.code || err?.details || err?.message;
  console.warn(`${context}; usando copia local del navegador.`, code || err);
}

export async function checkCoursesMetaCloudStatus() {
  try {
    const { error } = await supabase
      .from('courses_meta')
      .select('id,data,updated_at')
      .eq('id', 'courses_meta')
      .maybeSingle();

    if (!error) {
      return { cloudReady: true, reason: 'ready', message: 'Publicación global activa' };
    }

    if (error.code === 'PGRST205') {
      return {
        cloudReady: false,
        reason: 'missing_table',
        message: `Falta crear la tabla courses_meta en Supabase. Ejecuta ${COURSES_META_TABLE_SQL_PATH}.`,
      };
    }

    return {
      cloudReady: false,
      reason: 'supabase_error',
      message: error.message || 'No fue posible validar Supabase.',
    };
  } catch (err) {
    return {
      cloudReady: false,
      reason: 'network_error',
      message: err?.message || 'No fue posible conectar con Supabase.',
    };
  }
}

export function createDebouncedSave(ms = 1500) {
  let timer = null;
  let pendingResolve = null;

  return function debouncedSave(fn) {
    return new Promise((resolve) => {
      if (timer) clearTimeout(timer);
      pendingResolve = resolve;
      timer = setTimeout(async () => {
        try {
          await fn();
          resolve(true);
        } catch {
          resolve(false);
        }
        timer = null;
        pendingResolve = null;
      }, ms);
    });
  };
}

export async function saveProgress(session, lessonId, courseId, completedVal) {
  if (!session?.user?.id) return;
  try {
    const { data: existing } = await supabase
      .from('user_progress')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    if (existing) {
      await supabase.from('user_progress').update({ completed: completedVal }).eq('id', existing.id);
    } else {
      await supabase
        .from('user_progress')
        .insert({ user_id: session.user.id, course_id: courseId || 'default', lesson_id: lessonId, completed: completedVal });
    }
  } catch (e) {
    console.error('Error saving progress:', e);
  }
}

export async function saveUserNote(session, lessonId, courseId, noteText) {
  if (!session?.user?.id) return;
  try {
    const { data: existing } = await supabase
      .from('user_notes')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();
    if (existing) {
      await supabase.from('user_notes').update({ note: noteText, updated_at: new Date() }).eq('id', existing.id);
    } else {
      await supabase
        .from('user_notes')
        .insert({ user_id: session.user.id, course_id: courseId || 'default', lesson_id: lessonId, note: noteText });
    }
  } catch (e) {
    console.error('Error saving note:', e);
  }
}

export function loadUserData(session, setCompleted, setNotes) {
  return async () => {
    try {
      if (!session?.user?.id) return [];

      const [progressResult, notesResult] = await Promise.all([
        supabase.from('user_progress').select('*').eq('user_id', session.user.id),
        supabase.from('user_notes').select('*').eq('user_id', session.user.id),
      ]);

      const loadedCompleted = {};
      if (progressResult.data) {
        progressResult.data.forEach((p) => (loadedCompleted[p.lesson_id] = p.completed));
      }

      const loadedNotes = {};
      if (notesResult.data) {
        notesResult.data.forEach((n) => (loadedNotes[n.lesson_id] = n.note));
      }

      return { completed: loadedCompleted, notes: loadedNotes };
    } catch (err) {
      console.error('Error loading user data:', err);
      return { completed: {}, notes: {} };
    }
  };
}

// ─── Problema 1: Courses Meta via Supabase (instead of localStorage) ───

export function normalizeCoursesMeta(courses = []) {
  if (!Array.isArray(courses)) return [];

  return courses.map((course, courseIndex) => ({
    id: String(course?.id || `course_${courseIndex + 1}`),
    title: String(course?.title || 'Curso sin título'),
    description: String(course?.description || ''),
    thumbnail: course?.thumbnail || '',
    category: String(course?.category || 'Prosperidad'),
    duration: String(course?.duration || '0h 0m'),
    lessons: Array.isArray(course?.lessons)
      ? course.lessons.map((lesson, lessonIndex) => ({
          id: String(lesson?.id || `lesson_${courseIndex + 1}_${lessonIndex + 1}`),
          title: String(lesson?.title || 'Clase sin título'),
          description: String(lesson?.description || ''),
          dayUnlock: Number.isFinite(Number(lesson?.dayUnlock)) ? Number(lesson.dayUnlock) : 0,
          duration: String(lesson?.duration || '0m'),
          youtubeUrl: typeof lesson?.youtubeUrl === 'string' ? lesson.youtubeUrl : '',
          localVideoUrl: typeof lesson?.localVideoUrl === 'string' ? lesson.localVideoUrl : '',
          materials: Array.isArray(lesson?.materials)
            ? lesson.materials.map((material, materialIndex) => ({
                name: String(material?.name || `Material ${materialIndex + 1}`),
                url: typeof material?.url === 'string' ? material.url : '',
              }))
            : [],
        }))
      : [],
  }));
}

/**
 * Load courses metadata from Supabase.
 * Returns the courses array or null if not found.
 */
export async function loadCoursesMeta() {
  try {
    const { data, error } = await supabase
      .from('courses_meta')
      .select('data')
      .eq('id', 'courses_meta')
      .maybeSingle();

    if (error) {
      logCoursesMetaFallback('No fue posible cargar courses_meta desde Supabase', error);
      return loadLocalCoursesMeta();
    }

    const remoteCourses = Array.isArray(data?.data) ? normalizeCoursesMeta(data.data) : null;
    if (remoteCourses?.length > 0) return remoteCourses;

    return loadLocalCoursesMeta() || remoteCourses || [];
  } catch (err) {
    logCoursesMetaFallback('No fue posible cargar courses_meta desde Supabase', err);
    return loadLocalCoursesMeta();
  }
}

/**
 * Save courses metadata to Supabase (upsert).
 * Only admin should call this.
 */
export async function saveCoursesMeta(courses) {
  const cleanCourses = sanitizeCoursesForPersistence(courses);
  const localSaved = saveLocalCoursesMeta(cleanCourses);

  try {
    const { error } = await supabase
      .from('courses_meta')
      .upsert({
        id: 'courses_meta',
        data: cleanCourses,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) throw error;
    return { cloudSaved: true, localSaved };
  } catch (err) {
    logCoursesMetaFallback('No fue posible guardar courses_meta en Supabase', err);
    return { cloudSaved: false, localSaved, error: err };
  }
}
