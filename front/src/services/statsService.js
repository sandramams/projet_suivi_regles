// ============================================================
// FICHIER  : src/services/statsService.js
// RÔLE     : Appels API pour les statistiques et le calendrier.
// BACKEND  : controllers/statsController.js
// BASE URL : /api/v1/stats
// ============================================================

import api from './api';

// GET /api/v1/stats/overview — Vue globale des statistiques
// Retourne : durées moyennes, répartition flux, top symptômes
export const getStatsOverview = async () => {
  const { data } = await api.get('/stats/overview');
  return data.data;
};

// GET /api/v1/stats/calendar/:year/:month — Calendrier mensuel annoté
// Retourne un objet { "2024-03-15": { phases: [...], symptoms: [...] } }
export const getMonthlyCalendar = async (year, month) => {
  const { data } = await api.get(`/stats/calendar/${year}/${month}`);
  return data.data;
};

// GET /api/v1/stats/cycles-history — Historique des durées de cycles
// Utilisé pour les graphiques Recharts
export const getCyclesHistory = async (limit = 12) => {
  const { data } = await api.get('/stats/cycles-history', { params: { limit } });
  return data.data;
};