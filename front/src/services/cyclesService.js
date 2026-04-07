// ============================================================
// FICHIER  : src/services/cycleService.js
// RÔLE     : Fonctions d'appel API pour les cycles menstruels.
// BACKEND  : controllers/cycleController.js
// BASE URL : /api/v1/cycles
// ============================================================

import api from './api';

// ── TABLEAU DE BORD ─────────────────────────────────────────
// GET /api/v1/cycles/dashboard
// Données complètes pour la page d'accueil :
// phase actuelle, jours restants, prochain cycle, symptômes du jour
export const getDashboard = async () => {
  const { data } = await api.get('/cycles/dashboard');
  return data.data;
};

// ── PRÉDICTIONS ─────────────────────────────────────────────
// GET /api/v1/cycles/predictions
// Retourne les 3 prochains cycles prédits avec leurs fenêtres fertiles
export const getPredictions = async () => {
  const { data } = await api.get('/cycles/predictions');
  return data.data;
};

// ── LISTE DES CYCLES ────────────────────────────────────────
// GET /api/v1/cycles?page=1&limit=12
// Retourne les cycles paginés, du plus récent au plus ancien
export const getCycles = async (page = 1, limit = 12) => {
  const { data } = await api.get('/cycles', { params: { page, limit } });
  return data.data;
};

// ── DÉTAIL D'UN CYCLE ───────────────────────────────────────
// GET /api/v1/cycles/:id
export const getCycleById = async (id) => {
  const { data } = await api.get(`/cycles/${id}`);
  return data.data.cycle;
};

// ── CRÉER UN CYCLE ──────────────────────────────────────────
// POST /api/v1/cycles
// { start_date, end_date?, flow_level, notes? }
// Déclenche automatiquement le recalcul des prédictions côté backend
export const createCycle = async (cycleData) => {
  const { data } = await api.post('/cycles', cycleData);
  return data.data.cycle;
};

// ── MODIFIER UN CYCLE ───────────────────────────────────────
// PUT /api/v1/cycles/:id
// Utile pour ajouter la date de fin quand les règles sont terminées
export const updateCycle = async (id, updates) => {
  const { data } = await api.put(`/cycles/${id}`, updates);
  return data.data.cycle;
};

// ── SUPPRIMER UN CYCLE ──────────────────────────────────────
// DELETE /api/v1/cycles/:id
export const deleteCycle = async (id) => {
  const { data } = await api.delete(`/cycles/${id}`);
  return data;
};