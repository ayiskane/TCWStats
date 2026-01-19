import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import RecordPage from './components/match/RecordPage';
import MatchRecorder from './components/match/MatchRecorder';
import TeamMatchRecorder from './components/match/TeamMatchRecorder';
import HistoryPage from './components/match/HistoryPage';
import MatchDetail from './components/match/MatchDetail';
import PlayersPage from './components/player/PlayersPage';
import PlayerDetail from './components/player/PlayerDetail';
import AnalyticsPage from './components/analytics/AnalyticsPage';
import SettingsPage from './components/settings/SettingsPage';
import { useApp } from './context/AppContext';

function App() {
  const { state } = useApp();

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-kendo-navy flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-kendo-red border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-kendo-cream/60">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<RecordPage />} />
        <Route path="record" element={<RecordPage />} />
        <Route path="record/individual" element={<MatchRecorder />} />
        <Route path="record/team" element={<TeamMatchRecorder />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:matchId" element={<MatchDetail />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="players/:playerId" element={<PlayerDetail />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
