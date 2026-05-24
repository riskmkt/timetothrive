export function parseDurationToMinutes(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, Math.round(value));
  if (typeof value !== 'string') return 0;

  const text = value.trim().toLowerCase();
  if (!text) return 0;

  const colonMatch = text.match(/^(\d+):([0-5]?\d)$/);
  if (colonMatch) return (Number(colonMatch[1]) * 60) + Number(colonMatch[2]);

  const hourMatch = text.match(/(\d+(?:[.,]\d+)?)\s*h/);
  const minuteMatch = text.match(/(\d+)\s*m/);
  const hours = hourMatch ? Number(hourMatch[1].replace(',', '.')) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;
  if (hours || minutes) return Math.max(0, Math.round((hours * 60) + minutes));

  const plainNumber = Number(text.replace(',', '.'));
  return Number.isFinite(plainNumber) ? Math.max(0, Math.round(plainNumber)) : 0;
}

export function formatDurationFromMinutes(totalMinutes, fallback = '1h 00m') {
  const minutes = Number.isFinite(Number(totalMinutes)) ? Math.max(0, Math.round(Number(totalMinutes))) : 0;
  if (minutes <= 0) return fallback;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours <= 0) return `${remaining}m`;
  return `${hours}h ${String(remaining).padStart(2, '0')}m`;
}

export function getCourseDuration(course, fallback = '1h 00m') {
  const lessons = Array.isArray(course?.lessons) ? course.lessons : [];
  const lessonsTotal = lessons.reduce((sum, lesson) => sum + parseDurationToMinutes(lesson?.duration), 0);
  if (lessonsTotal > 0) return formatDurationFromMinutes(lessonsTotal, fallback);

  const stored = parseDurationToMinutes(course?.duration);
  return stored > 0 ? formatDurationFromMinutes(stored, fallback) : fallback;
}

export function withComputedCourseDurations(courses = []) {
  return Array.isArray(courses)
    ? courses.map(course => ({ ...course, duration: getCourseDuration(course) }))
    : [];
}
