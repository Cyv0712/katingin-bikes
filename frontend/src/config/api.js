const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

export const apiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const toAbsoluteUploadUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) {
    // Inject Cloudinary auto-format (WebP/AVIF) and auto-quality optimizations dynamically
    if (path.includes('res.cloudinary.com') && !path.includes('f_auto') && !path.includes('q_auto')) {
      const uploadMarker = '/upload/';
      const idx = path.indexOf(uploadMarker);
      if (idx !== -1) {
        return path.slice(0, idx + uploadMarker.length) + 'f_auto,q_auto/' + path.slice(idx + uploadMarker.length);
      }
    }
    return path;
  }
  if (path.startsWith('/uploads')) return apiUrl(path);
  return path;
};

export { API_BASE_URL };
