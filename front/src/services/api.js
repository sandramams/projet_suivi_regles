// ============================================================
// FICHIER  : src/services/api.js
// RÔLE     : Instance Axios centralisée pour tous les appels API.
//            Configure automatiquement :
//            - L'URL de base du backend Express
//            - L'injection du token JWT dans chaque requête
//            - La gestion des erreurs 401 (token expiré → déconnexion)
//
// UTILISATION :
//   import api from '../services/api';
//   const { data } = await api.get('/cycles');
//   const { data } = await api.post('/cycles', { start_date: '2024-03-15' });
// ============================================================

import axios from 'axios';

// URL de base depuis les variables d'environnement
// Valeur par défaut : http://localhost:5000/api/v1 (dev local)
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Création de l'instance Axios avec la configuration de base
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000, // 15 secondes avant d'abandonner la requête
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── INTERCEPTEUR DE REQUÊTE ─────────────────────────────────
// Exécuté AVANT chaque requête envoyée au serveur.
// Injecte automatiquement le token JWT si l'utilisateur est connecté.
api.interceptors.request.use(
  (config) => {
    // Récupère le token stocké dans localStorage
    // (stocké lors du login dans authService.js)
    const token = localStorage.getItem('cycletracker_token');

    if (token) {
      // Ajoute le header Authorization : "Bearer <token>"
      // Le backend Express le lit dans authMiddleware.js
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajoute la langue de l'interface pour les messages d'erreur bilingues
    const lang = localStorage.getItem('cycletracker_lang') || 'fr';
    config.headers['Accept-Language'] = lang;

    return config;
  },
  (error) => Promise.reject(error)
);

// ── INTERCEPTEUR DE RÉPONSE ─────────────────────────────────
// Exécuté APRÈS chaque réponse reçue du serveur.
// Gère les erreurs de manière centralisée.
api.interceptors.response.use(
  // Réponse réussie (2xx) : on la laisse passer telle quelle
  (response) => response,

  // Erreur (4xx, 5xx) : traitement centralisé
  (error) => {
    const status = error.response?.status;
    const code   = error.response?.data?.code;

    // Token expiré ou invalide → déconnexion automatique
    if (status === 401 && (code === 'TOKEN_EXPIRED' || code === 'TOKEN_INVALID')) {
      // Supprime les données de session
      localStorage.removeItem('cycletracker_token');
      localStorage.removeItem('cycletracker_user');

      // Redirige vers la page de connexion
      // Utilise window.location car on est hors d'un composant React
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }

    // Enrichit l'erreur avec le message du backend (FR ou EN selon la langue)
    const lang = localStorage.getItem('cycletracker_lang') || 'fr';
    if (error.response?.data) {
      const data = error.response.data;
      error.userMessage = lang === 'fr'
        ? (data.message    || 'Une erreur est survenue.')
        : (data.messageEn  || 'An error occurred.');
      error.fieldErrors = data.errors || null;
    } else {
      error.userMessage = lang === 'fr'
        ? 'Impossible de contacter le serveur.'
        : 'Unable to reach the server.';
    }

    return Promise.reject(error);
  }
);

export default api;