import api from '../utils/api';

export const getPublishedBlogArticles = async () => {
  const { data } = await api.get('/blog-articles');
  return data || [];
};

export const getAdminBlogArticles = async () => {
  const { data } = await api.get('/blog-articles/admin');
  return data || [];
};

export const createBlogArticle = async (payload) => {
  const { data } = await api.post('/blog-articles', payload);
  return data;
};

export const updateBlogArticle = async (id, payload) => {
  const { data } = await api.put(`/blog-articles/${id}`, payload);
  return data;
};

export const deleteBlogArticle = async (id) => {
  await api.delete(`/blog-articles/${id}`);
};
