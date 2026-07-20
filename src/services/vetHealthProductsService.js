import api from '../utils/api';

export const HEALTH_SUBTYPE_FALLBACK = [
  { id: 'antiparasitaire', label: 'Antiparasitaires' },
  { id: 'vermifuge', label: 'Vermifuges' },
  { id: 'vitamine', label: 'Vitamines' },
  { id: 'dents', label: 'Produits pour les dents' },
  { id: 'desinfectant', label: 'Désinfectants' },
  { id: 'lingettes', label: 'Lingettes nettoyantes' },
  { id: 'oreilles_yeux', label: 'Nettoyants oreilles & yeux' },
];

export async function fetchHealthSubtypes() {
  try {
    const { data } = await api.get('/vet/health-products/subtypes');
    return data.subtypes || HEALTH_SUBTYPE_FALLBACK;
  } catch {
    return HEALTH_SUBTYPE_FALLBACK;
  }
}

export async function fetchPartnerVendors() {
  try {
    const { data } = await api.get('/vet/health-products/vendors');
    return data.vendors || [];
  } catch {
    return [];
  }
}

export async function fetchVetHealthCollaborations() {
  try {
    const { data } = await api.get('/vet/health-products');
    return data.items || [];
  } catch {
    return [];
  }
}

export async function publishHealthProduct(payload) {
  const { data } = await api.post('/vet/health-products', payload);
  return data;
}

export async function fetchVendorHealthProposals() {
  try {
    const { data } = await api.get('/ecosystem/vendor/health-proposals');
    return data.items || [];
  } catch {
    return [];
  }
}

export async function respondVendorHealthProposal(id, action) {
  const { data } = await api.patch(`/ecosystem/vendor/health-proposals/${id}`, { action });
  return data;
}
