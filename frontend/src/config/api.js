const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/+$/, '');

export const apiUrl = (path = '') => {
  if (!path) return API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const toAbsoluteUploadUrl = (path) => {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) {
    if (path.includes('res.cloudinary.com')) {
      // Strip out any existing f_auto,q_auto transformations to fetch the raw image
      const cleanPath = path.replace(/\/f_auto,q_auto\//, '/');
      return apiUrl(`/api/bikes/image-proxy?url=${encodeURIComponent(cleanPath)}`);
    }
    return path;
  }
  if (path.startsWith('/uploads')) return apiUrl(path);
  return path;
};

export { API_BASE_URL };
