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
  const hostname = url.hostname.toLowerCase();
  const pathSegments = url.pathname.split('/').filter(Boolean);

  const youtubeHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtu.be']);
  if (youtubeHosts.has(hostname)) {
    let videoId = '';

    if (hostname === 'youtu.be' || hostname === 'www.youtu.be') {
      videoId = pathSegments[0] || '';
    } else if (pathSegments[0] === 'watch') {
      videoId = url.searchParams.get('v') || '';
    } else if (pathSegments[0] === 'embed' || pathSegments[0] === 'shorts') {
      videoId = pathSegments[1] || '';
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
  }

  const vimeoHosts = new Set(['vimeo.com', 'www.vimeo.com', 'player.vimeo.com']);
  if (vimeoHosts.has(hostname)) {
    const videoId = pathSegments.find((segment) => /^\d+$/.test(segment)) || '';
    return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
  }

  return normalized;
};
