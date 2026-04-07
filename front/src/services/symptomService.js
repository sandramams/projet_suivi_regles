// ============================================================
// FICHIER  : src/services/symptomService.js
// RÔLE     : Appels API pour le carnet de bord des symptômes.
// BACKEND  : controllers/symptomController.js
// BASE URL : /api/v1/symptoms
// ============================================================

import api from './api';

// GET /api/v1/symptoms/date/:date — Symptômes d'un jour précis
export const getSymptomsByDate = async (date) => {
  const { data } = await api.get(`/symptoms/date/${date}`);
  return data.data;
};

// GET /api/v1/symptoms?start=&end=&type= — Symptômes sur une période
export const getSymptomsByRange = async ({ start, end, type } = {}) => {
  const { data } = await api.get('/symptoms', { params: { start, end, type } });
  return data.data;
};

// POST /api/v1/symptoms — Enregistrer un symptôme
// { logged_date, type, value, intensity?, notes? }
export const createSymptom = async (symptomData) => {
  const { data } = await api.post('/symptoms', symptomData);
  return data.data.symptom;
};

// PUT /api/v1/symptoms/:id — Modifier un symptôme
export const updateSymptom = async (id, updates) => {
  const { data } = await api.put(`/symptoms/${id}`, updates);
  return data.data.symptom;
};

// DELETE /api/v1/symptoms/:id — Supprimer un symptôme
export const deleteSymptom = async (id) => {
  const { data } = await api.delete(`/symptoms/${id}`);
  return data;
};