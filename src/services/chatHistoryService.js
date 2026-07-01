import api from '../utils/api';

export const fetchEnrichedChatHistory = async ({ limit = 120 } = {}) => {
  const { data } = await api.get('/chat/history/enriched', { params: { limit } });
  return data;
};

export const analyzeChatImage = async ({ petName, imageHint, imageBase64, imagePreview }) => {
  const { data } = await api.post('/chat/analyze-image', {
    petName,
    imageHint,
    imageBase64,
    imagePreview,
  });
  return data;
};

export const fetchAdminChatHistory = async (userId) => {
  const { data } = await api.get('/chat/history/admin', {
    params: userId ? { userId } : {},
  });
  return data;
};

export default {
  fetchEnrichedChatHistory,
  analyzeChatImage,
  fetchAdminChatHistory,
};
