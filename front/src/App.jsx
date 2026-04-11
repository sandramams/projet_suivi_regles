// ============================================================
// FICHIER  : src/App.jsx
// RÔLE     : Routeur principal — associe chaque URL à sa page.
//            Routes publiques (auth) et routes protégées (JWT).
//            → Chemin dans le projet : src/App.jsx
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import AppLayout         from './components/layout/AppLayout';
import ProtectedRoute    from './components/layout/ProtectedRoute';

// Pages auth (accessibles sans connexion)
import LoginPage          from './pages/auth/LoginPage';
import RegisterPage       from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage  from './pages/auth/ResetPasswordPage';

// Pages protégées (connexion requise)
import DashboardPage from './pages/DashboardPage';
import CalendarPage  from './pages/CalendarPage';
import LogCyclePage  from './pages/LogCyclePage';
import StatsPage     from './pages/StatsPage';
import SymptomsPage  from './pages/SymptomsPage';
import PartnerPage   from './pages/PartnerPage';
import SettingsPage  from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── ROUTES PUBLIQUES ── */}
        <Route path="/login"                element={<LoginPage />} />
        <Route path="/register"             element={<RegisterPage />} />
        <Route path="/forgot-password"      element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* ── ROUTES PROTÉGÉES ── */}
        {/* ProtectedRoute vérifie le JWT. AppLayout = Sidebar + Topbar + Outlet */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar"  element={<CalendarPage />} />
          <Route path="/log"       element={<LogCyclePage />} />
          <Route path="/stats"     element={<StatsPage />} />
          <Route path="/symptoms"  element={<SymptomsPage />} />
          <Route path="/partner"   element={<PartnerPage />} />
          <Route path="/settings"  element={<SettingsPage />} />
        </Route>

        {/* Redirections */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}