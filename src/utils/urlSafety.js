const allowHttpHttps = (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim());

const parseUrl = (value) => {
  if (!allowHttpHttps(value)) return null;

  try {
    return new URL(value.trim());
  } catch (error) {
    return null;
  }
};

export const getSafeHttpUrl = (value) => {
  const url = parseUrl(value);
  return url ? url.toString() : '';
};

export const getSafeGitHubRepoUrl = (value) => {
  const url = parseUrl(value);
  if (!url) return '';

  const hostname = url.hostname.toLowerCase();
  if (hostname !== 'github.com' && hostname !== 'www.github.com') return '';

  const segments = url.pathname.split('/').filter(Boolean);
  if (segments.length < 2) return '';

  const [owner, repo] = segments;
  return `https://github.com/${owner}/${repo.replace(/\.git$/i, '')}`;
};

export const getSafeVideoEmbedUrl = (value) => {
  const url = parseUrl(value);
  if (!url) return '';

  const normalized = url.toString();

  if (normalized.includes('youtube.com') || normalized.includes('youtu.be')) {
    const videoId = normalized.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }

  if (normalized.includes('vimeo.com')) {
    const videoId = normalized.match(/vimeo\.com\/(\d+)/)?.[1];
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  }

  return normalized;
};
