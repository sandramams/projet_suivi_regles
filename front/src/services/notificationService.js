// ============================================================
// FICHIER  : src/services/notificationService.js
// RÔLE     : Appels API pour les notifications utilisateur.
// BACKEND  : controllers/notificationController.js
// BASE URL : /api/v1/notifications
// ============================================================

import api from './api';

// GET /api/v1/notifications — Liste les notifications
export const getNotifications = async (page = 1, limit = 20) => {
  const { data } = await api.get('/notifications', { params: { page, limit } });
  return data.data;
};

// DELETE /api/v1/notifications/all — Supprimer toutes les notifications
export const clearNotifications = async () => {
  const { data } = await api.delete('/notifications/all');
  return data;
};