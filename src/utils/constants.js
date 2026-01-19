// Scoring targets
export const TARGETS = {
  MEN: 'men',
  KOTE: 'kote',
  DO: 'do',
  TSUKI: 'tsuki',
};

export const TARGET_LABELS = {
  [TARGETS.MEN]: 'Men',
  [TARGETS.KOTE]: 'Kote',
  [TARGETS.DO]: 'Do',
  [TARGETS.TSUKI]: 'Tsuki',
};

export const TARGET_COLORS = {
  [TARGETS.MEN]: 'red',
  [TARGETS.KOTE]: 'blue',
  [TARGETS.DO]: 'green',
  [TARGETS.TSUKI]: 'purple',
};

// Target sides
export const TARGET_SIDES = {
  CENTER: 'center',
  LEFT: 'left',
  RIGHT: 'right',
};

// Waza categories
export const WAZA_CATEGORIES = {
  SHIKAKE: 'shikake',
  OJI: 'oji',
};

// Individual waza types
export const WAZA = {
  // Shikake-waza (Attacking)
  IPPON_UCHI: 'ippon-uchi',
  RENZOKU: 'renzoku',
  HARAI: 'harai',
  DEBANA: 'debana',
  HIKI: 'hiki',
  
  // Oji-waza (Counter)
  NUKI: 'nuki',
  SURIAGE: 'suriage',
  KAESHI: 'kaeshi',
  UCHIOTOSHI: 'uchiotoshi',
};

export const WAZA_LABELS = {
  [WAZA.IPPON_UCHI]: 'Ippon-uchi (Single)',
  [WAZA.RENZOKU]: 'Renzoku (Consecutive)',
  [WAZA.HARAI]: 'Harai (Deflect)',
  [WAZA.DEBANA]: 'Debana (Intercept)',
  [WAZA.HIKI]: 'Hiki (Backward)',
  [WAZA.NUKI]: 'Nuki (Avoid)',
  [WAZA.SURIAGE]: 'Suriage (Slide)',
  [WAZA.KAESHI]: 'Kaeshi (Return)',
  [WAZA.UCHIOTOSHI]: 'Uchiotoshi (Knock)',
};

export const WAZA_BY_CATEGORY = {
  [WAZA_CATEGORIES.SHIKAKE]: [
    WAZA.IPPON_UCHI,
    WAZA.RENZOKU,
    WAZA.HARAI,
    WAZA.DEBANA,
    WAZA.HIKI,
  ],
  [WAZA_CATEGORIES.OJI]: [
    WAZA.NUKI,
    WAZA.SURIAGE,
    WAZA.KAESHI,
    WAZA.UCHIOTOSHI,
  ],
};

// Team positions (order matters for team matches)
export const POSITIONS = {
  SENPO: 'senpo',
  JIHO: 'jiho',
  CHUKEN: 'chuken',
  FUKUSHO: 'fukusho',
  TAISHO: 'taisho',
};

export const POSITION_LABELS = {
  [POSITIONS.SENPO]: 'Senpo (1st)',
  [POSITIONS.JIHO]: 'Jiho (2nd)',
  [POSITIONS.CHUKEN]: 'Chuken (3rd)',
  [POSITIONS.FUKUSHO]: 'Fukusho (4th)',
  [POSITIONS.TAISHO]: 'Taisho (5th)',
};

export const POSITION_ORDER = [
  POSITIONS.SENPO,
  POSITIONS.JIHO,
  POSITIONS.CHUKEN,
  POSITIONS.FUKUSHO,
  POSITIONS.TAISHO,
];

// Match types
export const MATCH_TYPES = {
  INDIVIDUAL: 'individual',
  TEAM: 'team',
};

export const MATCH_TYPE_LABELS = {
  [MATCH_TYPES.INDIVIDUAL]: 'Individual Match',
  [MATCH_TYPES.TEAM]: 'Team Match (5v5)',
};

// Match contexts
export const MATCH_CONTEXTS = {
  PRACTICE: 'practice',
  TOURNAMENT: 'tournament',
  FRIENDLY: 'friendly',
};

export const MATCH_CONTEXT_LABELS = {
  [MATCH_CONTEXTS.PRACTICE]: 'Practice Keiko',
  [MATCH_CONTEXTS.TOURNAMENT]: 'Tournament',
  [MATCH_CONTEXTS.FRIENDLY]: 'Friendly Match',
};

// Match formats
export const MATCH_FORMATS = {
  SANBON: 'sanbon',
  IPPON: 'ippon',
};

export const MATCH_FORMAT_LABELS = {
  [MATCH_FORMATS.SANBON]: 'Sanbon-shobu (First to 2)',
  [MATCH_FORMATS.IPPON]: 'Ippon-shobu (First to 1)',
};

// Match results
export const MATCH_RESULTS = {
  WIN: 'win',
  LOSS: 'loss',
  DRAW: 'draw',
  IN_PROGRESS: 'in_progress',
};

// Scorer types
export const SCORERS = {
  TCW: 'tcw',
  OPPONENT: 'opponent',
};

// Default match duration (5 minutes in ms)
export const DEFAULT_MATCH_DURATION = 5 * 60 * 1000;

// Encho duration (3 minutes in ms)
export const ENCHO_DURATION = 3 * 60 * 1000;

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format time from milliseconds to MM:SS.ss
export const formatTime = (ms) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  
  return {
    formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`,
    minutes,
    seconds,
    centiseconds,
  };
};

// Format date for display
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format datetime for display
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
