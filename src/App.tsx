// ============================================================
// APP - Main application with routing
// ============================================================

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GiveawaysPage from './pages/GiveawaysPage';
import GiveawaySettingsPage from './pages/GiveawaySettingsPage';
import EntriesPage from './pages/EntriesPage';
import EntryDetailPage from './pages/EntryDetailPage';
import VerificationPage from './pages/VerificationPage';
import DrawPage from './pages/DrawPage';
import WinnersPage from './pages/WinnersPage';
import AuditLogPage from './pages/AuditLogPage';
import AnnouncementPage from './pages/AnnouncementPage';
import ImportGuidePage from './pages/ImportGuidePage';
import ApiSetupWizard from './pages/ApiSetupWizard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  const { state } = useApp();
  
  return (
    <Routes>
      <Route 
        path="/login" 
        element={state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/giveaways" element={<ProtectedRoute><GiveawaysPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId" element={<ProtectedRoute><GiveawaySettingsPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/entries" element={<ProtectedRoute><EntriesPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/entries/:entryId" element={<ProtectedRoute><EntryDetailPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/verification" element={<ProtectedRoute><VerificationPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/draw" element={<ProtectedRoute><DrawPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/winners" element={<ProtectedRoute><WinnersPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/audit-log" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/announcement" element={<ProtectedRoute><AnnouncementPage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/import-guide" element={<ProtectedRoute><ImportGuidePage /></ProtectedRoute>} />
      <Route path="/giveaways/:giveawayId/api-setup" element={<ProtectedRoute><ApiSetupWizard /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
