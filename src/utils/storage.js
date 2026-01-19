// Local storage keys
const STORAGE_KEYS = {
  PLAYERS: 'tcwstats_players',
  MATCHES: 'tcwstats_matches',
  TEAM_MATCHES: 'tcwstats_team_matches',
  SETTINGS: 'tcwstats_settings',
};

// Save data to localStorage
export const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

// Load data from localStorage
export const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

// Remove data from localStorage
export const removeFromStorage = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing from localStorage:', error);
    return false;
  }
};

// Player storage
export const savePlayers = (players) => saveToStorage(STORAGE_KEYS.PLAYERS, players);
export const loadPlayers = () => loadFromStorage(STORAGE_KEYS.PLAYERS, []);

// Match storage
export const saveMatches = (matches) => saveToStorage(STORAGE_KEYS.MATCHES, matches);
export const loadMatches = () => loadFromStorage(STORAGE_KEYS.MATCHES, []);

// Team match storage
export const saveTeamMatches = (teamMatches) => saveToStorage(STORAGE_KEYS.TEAM_MATCHES, teamMatches);
export const loadTeamMatches = () => loadFromStorage(STORAGE_KEYS.TEAM_MATCHES, []);

// Settings storage
export const saveSettings = (settings) => saveToStorage(STORAGE_KEYS.SETTINGS, settings);
export const loadSettings = () => loadFromStorage(STORAGE_KEYS.SETTINGS, {
  defaultMatchFormat: 'sanbon',
  defaultMatchDuration: 300000, // 5 minutes
  showWazaPrompt: true,
  autoSave: true,
});

// Export all data as JSON
export const exportAllData = () => {
  const data = {
    players: loadPlayers(),
    matches: loadMatches(),
    teamMatches: loadTeamMatches(),
    settings: loadSettings(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tcwstats_export_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Import data from JSON file
export const importData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        
        if (data.players) savePlayers(data.players);
        if (data.matches) saveMatches(data.matches);
        if (data.teamMatches) saveTeamMatches(data.teamMatches);
        if (data.settings) saveSettings(data.settings);
        
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid file format'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

// Export matches as CSV
export const exportMatchesCSV = (matches) => {
  const headers = [
    'Date',
    'Type',
    'Context',
    'TCW Player',
    'Opponent',
    'Opponent Team',
    'Result',
    'TCW Score',
    'Opponent Score',
    'Duration (s)',
    'Scores Detail',
  ];
  
  const rows = matches.map(match => {
    const scoresDetail = match.scores.map(s => 
      `${s.timestamp}ms:${s.scorer}:${s.target}${s.waza ? ':' + s.waza : ''}`
    ).join('; ');
    
    return [
      match.date,
      match.type,
      match.context,
      match.tcwPlayer?.name || 'Unknown',
      match.opponent?.name || 'Unknown',
      match.opponent?.team || '',
      match.result,
      match.scores.filter(s => s.scorer === 'tcw').length,
      match.scores.filter(s => s.scorer === 'opponent').length,
      Math.floor(match.duration / 1000),
      scoresDetail,
    ].map(v => `"${v}"`).join(',');
  });
  
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tcwstats_matches_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
