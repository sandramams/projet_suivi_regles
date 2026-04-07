// ============================================================
// FICHIER  : src/hooks/useAuth.js
// RÔLE     : Raccourci pour accéder à AuthContext depuis n'importe
//            quel composant sans importer le contexte directement.
//
// UTILISATION :
//   const { user, login, logout, isAuthenticated } = useAuth();
// ============================================================

import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de <AuthProvider>');
  }
  return context;
}