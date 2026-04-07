// ============================================================
// FICHIER  : src/context/AuthContext.jsx
// RÔLE     : Context React qui gère l'état d'authentification global.
//            Disponible dans tous les composants via useAuth().
//            - Stocke l'utilisateur connecté et son token JWT
//            - Expose les fonctions login, logout, register
//            - Vérifie au démarrage si une session existe déjà
// ============================================================

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  login    as loginApi,
  logout   as logoutApi,
  register as registerApi,
  getMe,
  getStoredToken,
  getStoredUser,
} from '../services/authService';

// Création du contexte (valeur par défaut null)
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Utilisateur connecté (null si non connecté)
  const [user, setUser] = useState(null);

  // État de chargement initial (vérification de session)
  const [loading, setLoading] = useState(true);

  // ── INITIALISATION : Vérifier la session existante ─────────
  // Au premier chargement de l'app, on vérifie si un token
  // valide existe en localStorage pour restaurer la session.
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      const storedUser = getStoredUser();

      if (token && storedUser) {
        // Restaure l'utilisateur depuis localStorage (affichage immédiat)
        setUser(storedUser);

        try {
          // Vérifie la fraîcheur des données en appelant le backend
          const freshUser = await getMe();
          setUser(freshUser);
        } catch {
          // Token expiré → nettoie la session
          logoutApi();
          setUser(null);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ── CONNEXION ───────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { user: loggedUser } = await loginApi(credentials);
    setUser(loggedUser);
    return loggedUser;
  }, []);

  // ── INSCRIPTION ─────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const { user: newUser } = await registerApi(userData);
    setUser(newUser);
    return newUser;
  }, []);

  // ── DÉCONNEXION ─────────────────────────────────────────────
  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  // ── MISE À JOUR DU PROFIL ──────────────────────────────────
  // Appelée après updateMe pour refléter les changements dans l'UI
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cycletracker_user', JSON.stringify(updatedUser));
  }, []);

  // Valeur exposée à tous les composants enfants
  const value = {
    user,           // Objet utilisateur ou null
    loading,        // true pendant la vérification initiale
    isAuthenticated: !!user, // Booléen pratique
    login,
    logout,
    register,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}