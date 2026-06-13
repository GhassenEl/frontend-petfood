import api from '../utils/api';

export const fetchNlpModelBenchmark = () =>
  api.get('/ml/admin/nlp-models/benchmark').then((r) => r.data);

export const fetchNlpModelConfig = () =>
  api.get('/ml/admin/nlp-models/config').then((r) => r.data);

export const updateNlpModelConfig = ({ modelId, selectionMode }) =>
  api.put('/ml/admin/nlp-models/config', { modelId, selectionMode }).then((r) => r.data);

export default {
  fetchNlpModelBenchmark,
  fetchNlpModelConfig,
  updateNlpModelConfig,
};
