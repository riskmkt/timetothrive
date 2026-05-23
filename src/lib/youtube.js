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

  // Já é embed URL
  if (trimmed.includes('/embed/')) {
    const match = trimmed.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    if (match) return { embedUrl: `https://www.youtube.com/embed/${match[1]}`, videoId: match[1] };
  }

  // youtu.be/XXXXX
  if (trimmed.includes('youtu.be/')) {
    const match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (match) return { embedUrl: `https://www.youtube.com/embed/${match[1]}`, videoId: match[1] };
  }

  // youtube.com/shorts/XXXXX
  if (trimmed.includes('/shorts/')) {
    const match = trimmed.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (match) return { embedUrl: `https://www.youtube.com/embed/${match[1]}`, videoId: match[1] };
  }

  // youtube.com/watch?v=XXXXX
  if (trimmed.includes('youtube.com/watch')) {
    try {
      const url = new URL(trimmed);
      const v = url.searchParams.get('v');
      if (v && v.length === 11) return { embedUrl: `https://www.youtube.com/embed/${v}`, videoId: v };
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
