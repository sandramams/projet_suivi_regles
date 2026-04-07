// ============================================================
// FICHIER  : src/index.jsx
// RÔLE     : Point d'entrée de l'application React.
//            Monte le composant <App /> dans le DOM (div#root de index.html).
//            Enveloppe tout dans les providers de contexte globaux
//            et dans le Toaster pour les notifications.
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

// CSS global : variables, reset, animations
import './styles/index.css';

// Composant racine de l'application
import App from './App';

// Providers de contexte global
import { AuthProvider }     from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Récupère la div#root définie dans public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  // StrictMode : active des avertissements supplémentaires en développement
  // (doubles renders intentionnels pour détecter les effets de bord)
  <React.StrictMode>

    {/* LanguageProvider : gère la langue active (fr/en) dans toute l'app */}
    <LanguageProvider>

      {/* AuthProvider : gère l'utilisateur connecté et son token JWT */}
      <AuthProvider>

        {/* Composant principal avec le routeur React Router */}
        <App />

        {/* Toaster : affiche les notifications toast (succès, erreurs...)
            Position en bas à droite, style personnalisé via index.css */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13.5px',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#2E7D32', secondary: '#E8F5E9' },
            },
            error: {
              iconTheme: { primary: '#C62828', secondary: '#FFEBEE' },
            },
          }}
        />

      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);