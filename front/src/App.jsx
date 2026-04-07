// ============================================================
// FICHIER  : src/App.jsx
// RÔLE     : Routeur principal de l'application.
//            Définit toutes les routes (URLs) et les associe
//            aux pages correspondantes.
//            Les routes protégées nécessitent d'être connecté ;
//            sinon React Router redirige vers /login.
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout principal (Sidebar + Topbar + zone de contenu)
import AppLayout      from './components/layout/AppLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages d'authentification (accessibles sans être connecté)
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';

// Pages protégées (nécessitent un compte)
import DashboardPage from './pages/DashboardPage';
import CalendarPage  from './pages/CalendarPage';
import LogCyclePage  from './pages/LogCyclePage';
import StatsPage     from './pages/StatsPage';
import SymptomsPage  from './pages/SymptomsPage';
import PartnerPage   from './pages/PartnerPage';
import SettingsPage  from './pages/SettingsPage';

function App() {
  return (
    // BrowserRouter active le routage basé sur l'URL du navigateur
    // (ex : /dashboard, /calendar, /log)
    <BrowserRouter>
      <Routes>

        {/* ── ROUTES PUBLIQUES (sans connexion) ─────────────── */}
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── ROUTES PROTÉGÉES (connexion requise) ──────────── */}
        {/* ProtectedRoute vérifie le token JWT et redirige vers
            /login si l'utilisateur n'est pas authentifié.
            AppLayout enveloppe toutes les pages protégées
            avec la Sidebar et la Topbar. */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard"  element={<DashboardPage />} />
          <Route path="/calendar"   element={<CalendarPage />} />
          <Route path="/log"        element={<LogCyclePage />} />
          <Route path="/stats"      element={<StatsPage />} />
          <Route path="/symptoms"   element={<SymptomsPage />} />
          <Route path="/partner"    element={<PartnerPage />} />
          <Route path="/settings"   element={<SettingsPage />} />
        </Route>

        {/* Route racine : redirige vers /dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Route inconnue : redirige vers /dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;