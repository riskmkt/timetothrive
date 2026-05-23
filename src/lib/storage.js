import { supabase } from './supabaseClient.js';

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
      console.error('Error loading courses_meta:', error);
      return null;
    }

    return data?.data ? normalizeCoursesMeta(data.data) : null;
  } catch (err) {
    console.error('Error loading courses_meta:', err);
    return null;
  }
}

/**
 * Save courses metadata to Supabase (upsert).
 * Only admin should call this.
 */
export async function saveCoursesMeta(courses) {
  try {
    // Strip non-serializable fields (like imported images) before saving
    const cleanCourses = normalizeCoursesMeta(courses).map(c => ({
      ...c,
      thumbnail: typeof c.thumbnail === 'string' ? c.thumbnail : '',
    }));

    const { error } = await supabase
      .from('courses_meta')
      .upsert({
        id: 'courses_meta',
        data: cleanCourses,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (error) throw error;
  } catch (err) {
    console.error('Error saving courses_meta:', err);
    throw err;
  }
}
