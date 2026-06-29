export const createSlug = (bike) => {
  if (!bike) return '';
  const brand = (bike.brand || '').trim();
  const model = (bike.model || '').trim();
  const year = bike.year ? String(bike.year).trim() : '';
  
  return `${brand} ${model} ${year}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters except alphanumeric, spaces, hyphens
    .replace(/\s+/g, '-')     // Replace spaces with single hyphen
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Trim hyphens from ends
};
