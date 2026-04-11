// ============================================================
// FICHIER  : src/hooks/useAuth.js
// RÔLE     : Raccourci pour accéder à AuthContext.
// UTILISATION : const { user, login, logout } = useAuth();
// → Chemin dans le projet : src/hooks/useAuth.js
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être dans <AuthProvider>');
  return ctx;
}