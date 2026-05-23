/**
 * Converte qualquer formato de URL do YouTube para embed URL
 *
 * Aceita:
 * - https://youtube.com/watch?v=XXXXX
 * - https://youtu.be/XXXXX
 * - https://www.youtube.com/embed/XXXXX
 * - https://youtube.com/watch?v=XXXXX&t=123
 * - https://youtube.com/shorts/XXXXX
 * - Apenas o ID: XXXXX
 */
export function parseYouTubeUrl(input) {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  if (!trimmed) return null;

  const extractVideoId = (value) => {
    const match = value.match(/(?:v=|\/embed\/|youtu\.be\/|\/shorts\/|\/live\/|\/v\/)([a-zA-Z0-9_-]{11})/);
    return match?.[1] || null;
  };

  const directVideoId = extractVideoId(trimmed);
  if (directVideoId) {
    return { embedUrl: `https://www.youtube.com/embed/${directVideoId}`, videoId: directVideoId };
  }

  if (trimmed.includes('youtube.com') || trimmed.includes('youtu.be')) {
    try {
      const normalizedUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      const url = new URL(normalizedUrl);
      const v = url.searchParams.get('v');
      const pathVideoId = extractVideoId(url.pathname);
      const videoId = v || pathVideoId;
      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        return { embedUrl: `https://www.youtube.com/embed/${videoId}`, videoId };
      }
    } catch {
      return null;
    }
  }

  // Apenas o ID (11 caracteres)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return { embedUrl: `https://www.youtube.com/embed/${trimmed}`, videoId: trimmed };
  }

  return null;
}

export function isValidYouTubeUrl(input) {
  return parseYouTubeUrl(input) !== null;
}
