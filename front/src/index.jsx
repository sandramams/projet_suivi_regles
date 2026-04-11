// ============================================================
// FICHIER  : src/index.jsx
// RÔLE     : Point d'entrée React. Monte <App /> dans le DOM.
//            Enveloppe tout dans les providers globaux.
//            → Chemin dans le projet : src/index.jsx
// ============================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './styles/index.css';
import App from './App';
import { AuthProvider }     from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
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
            success: { iconTheme: { primary: '#2E7D32', secondary: '#E8F5E9' } },
            error:   { iconTheme: { primary: '#C62828', secondary: '#FFEBEE' } },
          }}
        />
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);