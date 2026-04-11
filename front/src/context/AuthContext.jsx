// ============================================================
// FICHIER  : src/context/AuthContext.jsx
// RÔLE     : Context global d'authentification.
//            Gère l'utilisateur connecté et son token JWT.
//            Accessible partout via useAuth().
// → Chemin dans le projet : src/context/AuthContext.jsx
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

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Vérification de la session au démarrage ──────────────
  // Lit le token localStorage et valide avec le backend
  useEffect(() => {
    const initAuth = async () => {
      const token       = getStoredToken();
      const storedUser  = getStoredUser();
      if (token && storedUser) {
        setUser(storedUser); // Affichage immédiat depuis le cache
        try {
          const freshUser = await getMe(); // Validation backend
          setUser(freshUser);
        } catch {
          logoutApi();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ── login ────────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    const { user: u } = await loginApi(credentials);
    setUser(u);
    return u;
  }, []);

  // ── register ─────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const { user: u } = await registerApi(userData);
    setUser(u);
    return u;
  }, []);

  // ── logout ───────────────────────────────────────────────
  const logout = useCallback(() => {
    logoutApi();
    setUser(null);
  }, []);

  // ── updateUser : met à jour l'utilisateur dans le contexte
  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cycletracker_user', JSON.stringify(updatedUser));
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      register,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}