import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { 
  loadPlayers, savePlayers,
  loadMatches, saveMatches,
  loadTeamMatches, saveTeamMatches,
  loadSettings, saveSettings 
} from '../utils/storage';
import { generateId } from '../utils/constants';

// Initial state
const initialState = {
  players: [],
  matches: [],
  teamMatches: [],
  settings: {
    defaultMatchFormat: 'sanbon',
    defaultMatchDuration: 300000,
    showWazaPrompt: true,
    autoSave: true,
  },
  isLoading: true,
  error: null,
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_DATA: 'LOAD_DATA',
  
  // Player actions
  ADD_PLAYER: 'ADD_PLAYER',
  UPDATE_PLAYER: 'UPDATE_PLAYER',
  DELETE_PLAYER: 'DELETE_PLAYER',
  
  // Match actions
  ADD_MATCH: 'ADD_MATCH',
  UPDATE_MATCH: 'UPDATE_MATCH',
  DELETE_MATCH: 'DELETE_MATCH',
  
  // Team match actions
  ADD_TEAM_MATCH: 'ADD_TEAM_MATCH',
  UPDATE_TEAM_MATCH: 'UPDATE_TEAM_MATCH',
  DELETE_TEAM_MATCH: 'DELETE_TEAM_MATCH',
  
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
      
    case ACTIONS.LOAD_DATA:
      return {
        ...state,
        players: action.payload.players,
        matches: action.payload.matches,
        teamMatches: action.payload.teamMatches,
        settings: { ...state.settings, ...action.payload.settings },
        isLoading: false,
      };
      
    // Player actions
    case ACTIONS.ADD_PLAYER:
      return { ...state, players: [...state.players, action.payload] };
      
    case ACTIONS.UPDATE_PLAYER:
      return {
        ...state,
        players: state.players.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
      };
      
    case ACTIONS.DELETE_PLAYER:
      return {
        ...state,
        players: state.players.filter(p => p.id !== action.payload),
      };
      
    // Match actions
    case ACTIONS.ADD_MATCH:
      return { ...state, matches: [...state.matches, action.payload] };
      
    case ACTIONS.UPDATE_MATCH:
      return {
        ...state,
        matches: state.matches.map(m => 
          m.id === action.payload.id ? action.payload : m
        ),
      };
      
    case ACTIONS.DELETE_MATCH:
      return {
        ...state,
        matches: state.matches.filter(m => m.id !== action.payload),
      };
      
    // Team match actions
    case ACTIONS.ADD_TEAM_MATCH:
      return { ...state, teamMatches: [...state.teamMatches, action.payload] };
      
    case ACTIONS.UPDATE_TEAM_MATCH:
      return {
        ...state,
        teamMatches: state.teamMatches.map(m => 
          m.id === action.payload.id ? action.payload : m
        ),
      };
      
    case ACTIONS.DELETE_TEAM_MATCH:
      return {
        ...state,
        teamMatches: state.teamMatches.filter(m => m.id !== action.payload),
      };
      
    // Settings
    case ACTIONS.UPDATE_SETTINGS:
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
      
    default:
      return state;
  }
}

// Create context
const AppContext = createContext(null);

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Load data on mount
  useEffect(() => {
    try {
      const players = loadPlayers();
      const matches = loadMatches();
      const teamMatches = loadTeamMatches();
      const settings = loadSettings();
      
      dispatch({
        type: ACTIONS.LOAD_DATA,
        payload: { players, matches, teamMatches, settings },
      });
    } catch (error) {
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
    }
  }, []);
  
  // Auto-save when data changes
  useEffect(() => {
    if (!state.isLoading && state.settings.autoSave) {
      savePlayers(state.players);
      saveMatches(state.matches);
      saveTeamMatches(state.teamMatches);
      saveSettings(state.settings);
    }
  }, [state.players, state.matches, state.teamMatches, state.settings, state.isLoading]);
  
  // Action creators
  const actions = {
    // Players
    addPlayer: (playerData) => {
      const player = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...playerData,
      };
      dispatch({ type: ACTIONS.ADD_PLAYER, payload: player });
      return player;
    },
    
    updatePlayer: (player) => {
      dispatch({ type: ACTIONS.UPDATE_PLAYER, payload: player });
    },
    
    deletePlayer: (playerId) => {
      dispatch({ type: ACTIONS.DELETE_PLAYER, payload: playerId });
    },
    
    // Matches
    addMatch: (matchData) => {
      const match = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...matchData,
      };
      dispatch({ type: ACTIONS.ADD_MATCH, payload: match });
      return match;
    },
    
    updateMatch: (match) => {
      dispatch({ type: ACTIONS.UPDATE_MATCH, payload: match });
    },
    
    deleteMatch: (matchId) => {
      dispatch({ type: ACTIONS.DELETE_MATCH, payload: matchId });
    },
    
    // Team Matches
    addTeamMatch: (teamMatchData) => {
      const teamMatch = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        ...teamMatchData,
      };
      dispatch({ type: ACTIONS.ADD_TEAM_MATCH, payload: teamMatch });
      return teamMatch;
    },
    
    updateTeamMatch: (teamMatch) => {
      dispatch({ type: ACTIONS.UPDATE_TEAM_MATCH, payload: teamMatch });
    },
    
    deleteTeamMatch: (teamMatchId) => {
      dispatch({ type: ACTIONS.DELETE_TEAM_MATCH, payload: teamMatchId });
    },
    
    // Settings
    updateSettings: (settings) => {
      dispatch({ type: ACTIONS.UPDATE_SETTINGS, payload: settings });
    },
    
    // Get player by ID
    getPlayer: (playerId) => {
      return state.players.find(p => p.id === playerId);
    },
    
    // Get matches for a player
    getPlayerMatches: (playerId) => {
      return state.matches.filter(m => 
        m.tcwPlayerId === playerId || m.tcwPlayer?.id === playerId
      );
    },
  };
  
  return (
    <AppContext.Provider value={{ state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export default AppContext;
