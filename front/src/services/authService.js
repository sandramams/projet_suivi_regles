// ============================================================
// FICHIER  : src/services/authService.js
// RÔLE     : Toutes les fonctions d'appel API pour l'authentification.
//            Chaque fonction correspond à une route du backend Express.
//
// BACKEND CORRESPONDANT : controllers/authController.js
// BASE URL              : /api/v1/auth
// ============================================================

import api from './api';

// Clés localStorage pour persister la session entre les rechargements
const TOKEN_KEY = 'cycletracker_token';
const USER_KEY  = 'cycletracker_user';

// ── INSCRIPTION ─────────────────────────────────────────────
// POST /api/v1/auth/register
// Crée un nouveau compte et retourne un token JWT
export const register = async ({ first_name, email, password, language }) => {
  const { data } = await api.post('/auth/register', {
    first_name,
    email,
    password,
    language: language || 'fr',
  });

  // Stocke le token et l'utilisateur dans localStorage
  // pour maintenir la session après rechargement de la page
  if (data.data?.token) {
    localStorage.setItem(TOKEN_KEY, data.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
  }

  return data.data;
};

// ── CONNEXION ───────────────────────────────────────────────
// POST /api/v1/auth/login
// Vérifie les identifiants et retourne un token JWT
export const login = async ({ email, password }) => {
  const { data } = await api.post('/auth/login', { email, password });

  if (data.data?.token) {
    localStorage.setItem(TOKEN_KEY, data.data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
  }

  return data.data;
};

// ── DÉCONNEXION ─────────────────────────────────────────────
// Côté client uniquement — supprime les données locales.
// Le token JWT expire naturellement côté serveur.
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// ── PROFIL CONNECTÉ ─────────────────────────────────────────
// GET /api/v1/auth/me
// Récupère les données fraîches de l'utilisateur connecté
export const getMe = async () => {
  const { data } = await api.get('/auth/me');
  return data.data.user;
};

// ── MODIFIER LE PROFIL ──────────────────────────────────────
// PUT /api/v1/auth/me
// Modifie le prénom, la langue, les préférences de notifications, etc.
export const updateMe = async (updates) => {
  const { data } = await api.put('/auth/me', updates);

  // Met à jour l'utilisateur dans localStorage
  if (data.data?.user) {
    localStorage.setItem(USER_KEY, JSON.stringify(data.data.user));
  }

  return data.data.user;
};

// ── MOT DE PASSE OUBLIÉ ─────────────────────────────────────
// POST /api/v1/auth/forgot-password
// Envoie un email de réinitialisation si l'adresse existe
export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

// ── RÉINITIALISER LE MOT DE PASSE ───────────────────────────
// POST /api/v1/auth/reset-password/:token
// Définit un nouveau mot de passe via le token reçu par email
export const resetPassword = async (token, password) => {
  const { data } = await api.post(`/auth/reset-password/${token}`, { password });
  return data;
};

// ── CHANGER LE MOT DE PASSE ─────────────────────────────────
// POST /api/v1/auth/change-password
// Requiert l'ancien mot de passe pour en définir un nouveau
export const changePassword = async ({ current_password, new_password }) => {
  const { data } = await api.post('/auth/change-password', {
    current_password,
    new_password,
  });
  return data;
};

// ── UTILITAIRE : Récupérer le token stocké ──────────────────
// Utilisé par AuthContext pour vérifier si une session existe au démarrage
export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);
export const getStoredUser  = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};