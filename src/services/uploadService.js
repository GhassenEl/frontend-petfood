import api from '../utils/api';

/**
 * Upload image admin → stockage backend /api/uploads/{folder}/
 * @param {File} file
 * @param {'products'|'vendors'|'blog'|'misc'} folder
 */
export async function uploadAdminImage(file, folder = 'products') {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post(`/admin/uploads/${folder}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export function resolveUploadPreviewUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) return url;
  if (url.startsWith('/api/')) return url;
  if (url.startsWith('/uploads/')) return `/api${url}`;
  return url;
}
