import React, { useState } from 'react';
import { 
  Download, Upload, Trash2, Info, Database,
  ToggleLeft, ToggleRight, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportAllData, importData, exportMatchesCSV } from '../../utils/storage';

function SettingsPage() {
  const { state, updateSettings } = useApp();
  const [importStatus, setImportStatus] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleToggleWazaPrompt = () => {
    updateSettings({ showWazaPrompt: !state.settings.showWazaPrompt });
  };

  const handleToggleAutoSave = () => {
    updateSettings({ autoSave: !state.settings.autoSave });
  };

  const handleExportAll = () => {
    exportAllData();
  };

  const handleExportCSV = () => {
    exportMatchesCSV(state.matches);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImportStatus('loading');
      await importData(file);
      setImportStatus('success');
      window.location.reload(); // Reload to refresh data
    } catch (error) {
      setImportStatus('error');
      console.error('Import error:', error);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleClearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-8">
      <h1 className="text-xl font-semibold text-kendo-cream mb-6">Settings</h1>

      {/* Recording Preferences */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-kendo-cream/60 mb-4">Recording Preferences</h2>
        
        <div className="space-y-4">
          {/* Waza Prompt Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kendo-cream">Ask for technique (waza)</p>
              <p className="text-xs text-kendo-cream/50">
                Prompt for waza type after each score
              </p>
            </div>
            <button
              onClick={handleToggleWazaPrompt}
              className="text-kendo-cream"
            >
              {state.settings.showWazaPrompt ? (
                <ToggleRight className="w-10 h-6 text-kendo-red" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-kendo-gray" />
              )}
            </button>
          </div>

          {/* Auto Save Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kendo-cream">Auto-save</p>
              <p className="text-xs text-kendo-cream/50">
                Automatically save changes to local storage
              </p>
            </div>
            <button
              onClick={handleToggleAutoSave}
              className="text-kendo-cream"
            >
              {state.settings.autoSave ? (
                <ToggleRight className="w-10 h-6 text-kendo-red" />
              ) : (
                <ToggleLeft className="w-10 h-6 text-kendo-gray" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-kendo-cream/60 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data Management
        </h2>

        {/* Storage Info */}
        <div className="bg-kendo-navy rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Info className="w-4 h-4 text-kendo-cream/40" />
            <span className="text-xs text-kendo-cream/60">Local Storage</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-kendo-cream">{state.players.length}</p>
              <p className="text-xs text-kendo-cream/50">Players</p>
            </div>
            <div>
              <p className="text-lg font-bold text-kendo-cream">{state.matches.length}</p>
              <p className="text-xs text-kendo-cream/50">Matches</p>
            </div>
            <div>
              <p className="text-lg font-bold text-kendo-cream">{state.teamMatches.length}</p>
              <p className="text-xs text-kendo-cream/50">Team Matches</p>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-3">
          <button
            onClick={handleExportAll}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Data (JSON)
          </button>

          <button
            onClick={handleExportCSV}
            disabled={state.matches.length === 0}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Matches (CSV)
          </button>

          {/* Import */}
          <label className="btn btn-outline w-full flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import Data (JSON)
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {importStatus === 'loading' && (
            <p className="text-sm text-kendo-cream/60 text-center">Importing...</p>
          )}
          {importStatus === 'success' && (
            <p className="text-sm text-green-400 text-center">Import successful!</p>
          )}
          {importStatus === 'error' && (
            <p className="text-sm text-red-400 text-center">Import failed. Please check the file format.</p>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card border-red-600/30">
        <h2 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h2>

        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn w-full bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/30"
          >
            <Trash2 className="w-4 h-4 inline mr-2" />
            Clear All Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-400">
              Are you sure? This will permanently delete all players, matches, and settings.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="btn bg-red-600 text-white flex-1"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="card mt-6">
        <h2 className="text-sm font-semibold text-kendo-cream/60 mb-3">About</h2>
        <div className="space-y-2 text-sm text-kendo-cream/70">
          <p><strong>TCWStats</strong> v1.0.0</p>
          <p>Team Canada Women's Kendo Statistics Tracker</p>
          <p className="text-xs text-kendo-cream/50 mt-2">
            Built for tracking ippons, analyzing performance, and improving team results.
          </p>
        </div>
      </div>

      {/* Cloud Sync Placeholder */}
      <div className="card mt-6 bg-kendo-gold/10 border-kendo-gold/30">
        <h2 className="text-sm font-semibold text-kendo-gold mb-2">Coming Soon: Cloud Sync</h2>
        <p className="text-xs text-kendo-cream/60">
          Real-time collaboration and multi-device sync will be available in a future update.
          Your data is currently stored locally on this device.
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
