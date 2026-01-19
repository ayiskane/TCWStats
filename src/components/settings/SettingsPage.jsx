import React, { useState } from 'react';
import { 
  Settings, Download, Upload, Trash2, Database,
  ToggleLeft, ToggleRight, AlertTriangle, Check, Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportAllData, importData, exportMatchesCSV } from '../../utils/storage';
import { MATCH_FORMAT_LABELS } from '../../utils/constants';

function SettingsPage() {
  const { state, updateSettings } = useApp();
  const [importing, setImporting] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleExportJSON = () => {
    exportAllData();
  };

  const handleExportCSV = () => {
    exportMatchesCSV(state.matches);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    try {
      await importData(file);
      alert('Data imported successfully! Please refresh the page.');
      window.location.reload();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const handleClearData = () => {
    localStorage.clear();
    alert('All data cleared. Please refresh the page.');
    window.location.reload();
  };

  const toggleSetting = (key) => {
    updateSettings({ [key]: !state.settings[key] });
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-xl font-semibold text-kendo-cream mb-6">Settings</h1>

      {/* App Settings */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-kendo-cream/60 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          App Settings
        </h2>

        <div className="space-y-4">
          {/* Show Waza Prompt */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kendo-cream">Show Waza Selection</p>
              <p className="text-xs text-kendo-cream/50">
                Prompt to select technique after each ippon
              </p>
            </div>
            <button
              onClick={() => toggleSetting('showWazaPrompt')}
              className="text-kendo-cream"
            >
              {state.settings.showWazaPrompt ? (
                <ToggleRight className="w-8 h-8 text-kendo-red" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-kendo-gray" />
              )}
            </button>
          </div>

          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-kendo-cream">Auto Save</p>
              <p className="text-xs text-kendo-cream/50">
                Automatically save changes to local storage
              </p>
            </div>
            <button
              onClick={() => toggleSetting('autoSave')}
              className="text-kendo-cream"
            >
              {state.settings.autoSave ? (
                <ToggleRight className="w-8 h-8 text-kendo-red" />
              ) : (
                <ToggleLeft className="w-8 h-8 text-kendo-gray" />
              )}
            </button>
          </div>

          {/* Default Match Format */}
          <div>
            <p className="text-sm text-kendo-cream mb-2">Default Match Format</p>
            <select
              value={state.settings.defaultMatchFormat}
              onChange={(e) => updateSettings({ defaultMatchFormat: e.target.value })}
              className="select"
            >
              {Object.entries(MATCH_FORMAT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-kendo-cream/60 mb-4 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Data Management
        </h2>

        <div className="space-y-3">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export All Data (JSON)
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="btn btn-outline w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Matches (CSV)
          </button>

          {/* Import */}
          <label className="btn btn-outline w-full flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {importing ? 'Importing...' : 'Import Data (JSON)'}
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* Storage Stats */}
      <div className="card mb-6">
        <h2 className="text-sm font-semibold text-kendo-cream/60 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Storage Statistics
        </h2>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-kendo-cream">{state.players.length}</p>
            <p className="text-xs text-kendo-cream/50">Players</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-kendo-cream">{state.matches.length}</p>
            <p className="text-xs text-kendo-cream/50">Individual Matches</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-kendo-cream">{state.teamMatches.length}</p>
            <p className="text-xs text-kendo-cream/50">Team Matches</p>
          </div>
        </div>
      </div>

      {/* Cloud Sync Info */}
      <div className="card mb-6 bg-kendo-gold/10 border-kendo-gold/30">
        <h2 className="text-sm font-semibold text-kendo-gold mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Cloud Sync (Coming Soon)
        </h2>
        <p className="text-sm text-kendo-cream/70">
          Multi-device sync and team collaboration features will be available soon. 
          For now, use the export/import feature to backup and share data.
        </p>
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
            className="btn w-full bg-red-600/20 text-red-400 hover:bg-red-600/30 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-300">
              This will permanently delete all players, matches, and settings. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="btn bg-red-600 text-white hover:bg-red-700 flex-1"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="mt-8 text-center text-sm text-kendo-cream/40">
        <p className="font-semibold text-kendo-cream/60">TCWStats v1.0.0</p>
        <p>Team Canada Women's Kendo Statistics Tracker</p>
        <p className="mt-2">
          Built for tracking ippons, analyzing performance, and improving your kendo.
        </p>
      </div>
    </div>
  );
}

export default SettingsPage;
