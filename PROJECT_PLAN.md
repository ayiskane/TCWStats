# TCWStats - Team Canada Women's Kendo Statistics Tracker
## Comprehensive Project Plan

---

## 1. Executive Summary

TCWStats is a sport science analytics application designed specifically for Team Canada Women's Kendo team. The app enables real-time tracking of ippon (scoring strikes) during practice keikos and tournament matches, with precise timestamp recording for performance analysis.

### Core Value Proposition
- **Real-time scoring** with match timer integration
- **Detailed technique tracking** (what waza scored, where, when)
- **Historical analytics** for identifying patterns and improvement areas
- **Team-wide insights** for coaching decisions

---

## 2. Research Findings Summary

### 2.1 Kendo Scoring System (Datotsu-bui)

Based on research from the All Japan Kendo Federation and international competition rules:

| Target | Japanese | Description | Variations |
|--------|----------|-------------|------------|
| **Men** | 面 | Head/face strike | Shomen (center), Migi-men (right), Hidari-men (left) |
| **Kote** | 小手 | Wrist/forearm strike | Migi-kote (right), Hidari-kote (left - only valid when raised) |
| **Do** | 胴 | Torso strike | Migi-do (right), Hidari-do (left) |
| **Tsuki** | 突き | Throat thrust | Single target (restricted to senior dan grades) |

### 2.2 Technique Categories (Waza)

**Shikake-waza (Attacking Techniques):**
- Ippon-uchi (single strikes)
- Renzoku-waza (consecutive attacks: kote-men, kote-men-do)
- Harai-waza (deflecting then striking)
- Debana-waza (striking as opponent initiates)
- Hiki-waza (backward strikes from tsubazeriai)

**Oji-waza (Counter Techniques):**
- Nuki-waza (avoiding then countering)
- Suriage-waza (deflect-slide then strike)
- Kaeshi-waza (block, rotate, strike opposite side)
- Uchiotoshi-waza (knock down shinai then strike)

### 2.3 Key Performance Metrics (from academic research)

| Metric | Insight |
|--------|---------|
| Attack timing | 0.09s-0.12s attack duration has highest ippon success rate |
| Consistency | Quarter-finalists show significantly more consistent attack timing |
| Ippon variety | Modern trend shows most ippons are kote or men (declining variety) |
| Match duration | Matches increasingly going to encho (overtime) before scoring |

### 2.4 Match Formats

- **Sanbon-shobu**: First to 2 points wins (standard competition)
- **Ippon-shobu**: First to 1 point wins (some tournaments)
- **Match duration**: Typically 3-5 minutes, with encho (overtime) if tied

---

## 3. Feature Specification

### 3.1 Core Features (MVP)

#### A. Match Recording Module
```
┌─────────────────────────────────────────────────────────────┐
│  LIVE MATCH RECORDER                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐           ⏱️ 02:34.56           ┌─────────────┐
│  │   CANADA    │                                 │  OPPONENT   │
│  │             │         [START/PAUSE]           │             │
│  │     2       │          [RESET]                │     1       │
│  └─────────────┘                                 └─────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  QUICK SCORE BUTTONS                                    │
│  │                                                         │
│  │  [MEN]  [KOTE]  [DO]  [TSUKI]  [HANSOKU]               │
│  │                                                         │
│  │  Tap to score for selected player                       │
│  └─────────────────────────────────────────────────────────┘
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │  MATCH LOG                                              │
│  │  ─────────────────────────────────────────────────────  │
│  │  01:23.45  │  TCW Player  │  MEN (debana)  │  +1        │
│  │  02:01.12  │  Opponent    │  KOTE          │  +1        │
│  │  02:34.56  │  TCW Player  │  DO (kaeshi)   │  +1        │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

**Functions:**
- `startTimer()` - Begin match clock
- `pauseTimer()` - Pause for referee calls
- `recordIppon(player, target, waza, timestamp)` - Log a score
- `undoLastScore()` - Correct mistakes
- `endMatch()` - Finalize and save

#### B. Player Management
```
┌─────────────────────────────────────────────────────────────┐
│  TEAM ROSTER                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [+ Add Player]                          [Import CSV]       │
│                                                             │
│  ┌──────┬────────────────┬──────────┬───────────────────┐  │
│  │ #    │ Name           │ Position │ Stats             │  │
│  ├──────┼────────────────┼──────────┼───────────────────┤  │
│  │ 1    │ Tanaka, Yuki   │ Senpo    │ 12W-3L │ View →  │  │
│  │ 2    │ Sato, Mika     │ Jiho     │ 8W-5L  │ View →  │  │
│  │ 3    │ Yamamoto, Rin  │ Chuken   │ 15W-2L │ View →  │  │
│  │ 4    │ Watanabe, Hana │ Fukusho  │ 10W-4L │ View →  │  │
│  │ 5    │ Kobayashi, Mei │ Taisho   │ 18W-1L │ View →  │  │
│  └──────┴────────────────┴──────────┴───────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

**Data per Player:**
- Name, position (Senpo/Jiho/Chuken/Fukusho/Taisho)
- Preferred waza, strengths/weaknesses notes
- Historical match records

#### C. Match History & Search
```
┌─────────────────────────────────────────────────────────────┐
│  MATCH HISTORY                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Filter: [All Types ▼] [All Players ▼] [Date Range 📅]     │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐
│  │ 🏆 Tournament Match │ Jan 15, 2026                      │
│  │ TCW vs Japan │ Tanaka vs Suzuki │ WIN 2-1 │ Details → │
│  ├─────────────────────────────────────────────────────────┤
│  │ 🥋 Practice Keiko │ Jan 12, 2026                        │
│  │ Internal │ Sato vs Yamamoto │ WIN 2-0 │ Details →      │
│  ├─────────────────────────────────────────────────────────┤
│  │ 🥋 Practice Keiko │ Jan 10, 2026                        │
│  │ Internal │ Kobayashi vs Watanabe │ LOSS 1-2 │ Details →│
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Analytics Dashboard

#### A. Individual Player Analytics
```
┌─────────────────────────────────────────────────────────────┐
│  PLAYER PROFILE: Tanaka, Yuki                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Overall: 12W - 3L (80% win rate)                          │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ SCORING BREAKDOWN   │  │ IPPON TIMING DISTRIBUTION   │  │
│  │                     │  │                             │  │
│  │ Men:   ████████ 45% │  │      ▄▄                     │  │
│  │ Kote:  █████ 28%    │  │    ▄▄██▄▄                   │  │
│  │ Do:    ████ 22%     │  │  ▄▄██████▄▄                 │  │
│  │ Tsuki: █ 5%         │  │ ████████████                │  │
│  │                     │  │ 0:00  1:30  3:00  4:30      │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ WAZA SUCCESS RATE   │  │ POINTS CONCEDED             │  │
│  │                     │  │                             │  │
│  │ Debana:   72%       │  │ Men:   ████████████ 60%     │  │
│  │ Suriage:  65%       │  │ Kote:  ██████ 30%           │  │
│  │ Kote-Men: 58%       │  │ Do:    ██ 10%               │  │
│  │ Kaeshi:   45%       │  │                             │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  💡 INSIGHTS:                                               │
│  • Strong opener - 60% of ippons scored in first 90 sec    │
│  • Vulnerable to men after failed kote attempts            │
│  • Consider more hidari-do variations                      │
└─────────────────────────────────────────────────────────────┘
```

#### B. Team Analytics
```
┌─────────────────────────────────────────────────────────────┐
│  TEAM OVERVIEW                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Season Record: 45W - 12L (79%)                            │
│  Tournament Record: 8W - 2L (80%)                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  TEAM SCORING DISTRIBUTION (PIE CHART)                │  │
│  │                                                       │  │
│  │            ╭───────╮                                  │  │
│  │         ╭──│  MEN  │──╮      Men: 42%                 │  │
│  │        │   │  42%  │   │     Kote: 31%                │  │
│  │        │   ╰───────╯   │     Do: 22%                  │  │
│  │        │ KOTE │ │ DO  │     Tsuki: 5%                 │  │
│  │        │ 31%  │ │ 22% │                               │  │
│  │         ╰─────╯ ╰─────╯                               │  │
│  │              TSUKI 5%                                 │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  SCORING TIMELINE (LINE CHART)                        │  │
│  │                                                       │  │
│  │  Ippons │         ╱╲    ╱╲                           │  │
│  │  Scored │    ╱╲  ╱  ╲  ╱  ╲                          │  │
│  │         │ ╱╲╱  ╲╱    ╲╱    ╲                         │  │
│  │         └─────────────────────────                    │  │
│  │           Jan  Feb  Mar  Apr  May                     │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Advanced Features (Phase 2)

| Feature | Description | Priority |
|---------|-------------|----------|
| **Video Timestamp Sync** | Link video recordings to ippon timestamps | High |
| **Opponent Database** | Track recurring opponents' tendencies | High |
| **Export to CSV/PDF** | Generate reports for coaches | Medium |
| **Offline Mode** | Record matches without internet | Medium |
| **Multi-device Sync** | Cloud backup and team sharing | Medium |
| **Voice Recording** | Audio notes during matches | Low |
| **AI Insights** | Pattern recognition and suggestions | Low |

---

## 4. Data Architecture

### 4.1 Core Data Models

```typescript
// Player
interface Player {
  id: string;
  name: string;
  position: 'Senpo' | 'Jiho' | 'Chuken' | 'Fukusho' | 'Taisho' | null;
  notes: string;
  createdAt: Date;
}

// Match
interface Match {
  id: string;
  type: 'practice' | 'tournament' | 'friendly';
  format: 'sanbon' | 'ippon';
  date: Date;
  location: string;
  
  tcwPlayer: Player;
  opponent: {
    name: string;
    team: string;
  };
  
  scores: Score[];
  duration: number; // milliseconds
  result: 'win' | 'loss' | 'draw';
  
  notes: string;
}

// Score (Ippon)
interface Score {
  id: string;
  timestamp: number; // milliseconds from match start
  
  scorer: 'tcw' | 'opponent';
  
  target: 'men' | 'kote' | 'do' | 'tsuki';
  targetSide: 'center' | 'left' | 'right' | null;
  
  waza: Waza | null;
  wazaCategory: 'shikake' | 'oji' | null;
  
  isHansoku: boolean; // point from penalty
  
  notes: string;
}

// Waza types
type Waza = 
  // Shikake-waza
  | 'ippon-uchi'      // single strike
  | 'renzoku'         // consecutive (kote-men, etc.)
  | 'harai'           // deflect then strike
  | 'debana'          // strike on opponent's initiation
  | 'hiki'            // backward strike
  // Oji-waza
  | 'nuki'            // avoid then counter
  | 'suriage'         // slide-deflect then strike
  | 'kaeshi'          // block, rotate, strike
  | 'uchiotoshi';     // knock down then strike

// Analytics aggregations
interface PlayerStats {
  playerId: string;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  
  ipponsScored: {
    men: number;
    kote: number;
    do: number;
    tsuki: number;
  };
  
  ipponsConceded: {
    men: number;
    kote: number;
    do: number;
    tsuki: number;
  };
  
  wazaSuccessRate: Record<Waza, { attempts: number; successful: number }>;
  
  averageIpponTime: number; // avg timestamp of scoring
  scoringDistribution: number[]; // by minute bucket
}
```

### 4.2 Storage Strategy

**Phase 1 (MVP):** Browser localStorage + JSON export
- Simple, no backend required
- Data persists on device
- Export/import for backup

**Phase 2:** Cloud sync with Supabase or Firebase
- Multi-device access
- Team data sharing
- Automatic backups

---

## 5. UI/UX Design Specifications

### 5.1 Design Philosophy

**Aesthetic Direction:** "Precision Minimalism meets Traditional Japanese"

- **Color Palette:**
  ```
  Primary:    #1a1a2e (Deep navy - like kendo-gi)
  Secondary:  #c41e3a (Cardinal red - like men himo)
  Accent:     #f5f5f5 (Off-white - like keikogi)
  Success:    #2d5a27 (Forest green)
  Warning:    #d4a017 (Gold)
  ```

- **Typography:**
  - Headers: Bold, clean sans-serif (e.g., "Noto Sans JP")
  - Body: Readable, professional
  - Timer: Monospace, large, high contrast

- **Layout Principles:**
  - Large touch targets for match recording (mobile-first)
  - High contrast timer display
  - Minimal clicks to record a score
  - Clear visual hierarchy

### 5.2 Screen Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        APP NAVIGATION                        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
  ┌───────────┐       ┌───────────────┐      ┌───────────────┐
  │  RECORD   │       │    HISTORY    │      │   ANALYTICS   │
  │  (Home)   │       │               │      │               │
  └─────┬─────┘       └───────┬───────┘      └───────┬───────┘
        │                     │                      │
        ▼                     ▼                      ▼
  ┌───────────┐       ┌───────────────┐      ┌───────────────┐
  │  New      │       │  Match Detail │      │  Player Stats │
  │  Match    │       │  View         │      │  Dashboard    │
  │  Setup    │       └───────────────┘      └───────────────┘
  └─────┬─────┘                              
        │                                    ┌───────────────┐
        ▼                                    │  Team Stats   │
  ┌───────────┐                              │  Dashboard    │
  │  Live     │                              └───────────────┘
  │  Match    │
  │  Recorder │
  └─────┬─────┘
        │
        ▼
  ┌───────────┐
  │  Match    │
  │  Summary  │
  └───────────┘
```

### 5.3 Key Interaction Patterns

**Recording an Ippon (critical path - must be fast):**
1. Match is running with timer visible
2. Ippon occurs → User taps target button (MEN/KOTE/DO/TSUKI)
3. Quick dialog: Select who scored (TCW ✓ or Opponent)
4. Optional: Select waza type (can skip)
5. Score logged with timestamp → Returns to match view

**Total taps for basic recording: 2** (target + scorer)
**Total taps with waza: 3** (target + scorer + waza)

---

## 6. Technical Architecture

### 6.1 Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | React 18 | Modern, component-based, large ecosystem |
| **Build Tool** | Vite | Fast dev server, optimized builds |
| **Styling** | Tailwind CSS | Utility-first, rapid development |
| **State** | React Context + useReducer | Simple, no external dependencies |
| **Charts** | Recharts | React-native, customizable |
| **Icons** | Lucide React | Clean, consistent icon set |
| **Storage** | localStorage + IndexedDB | Offline-first capability |
| **PWA** | Vite PWA Plugin | Installable, works offline |

### 6.2 Project Structure

```
TCWStats/
├── public/
│   ├── favicon.ico
│   └── manifest.json          # PWA manifest
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Timer.jsx
│   │   │
│   │   ├── match/
│   │   │   ├── MatchRecorder.jsx
│   │   │   ├── ScoreButtons.jsx
│   │   │   ├── MatchLog.jsx
│   │   │   ├── MatchSetup.jsx
│   │   │   └── MatchSummary.jsx
│   │   │
│   │   ├── player/
│   │   │   ├── PlayerList.jsx
│   │   │   ├── PlayerCard.jsx
│   │   │   └── PlayerForm.jsx
│   │   │
│   │   ├── analytics/
│   │   │   ├── PlayerDashboard.jsx
│   │   │   ├── TeamDashboard.jsx
│   │   │   ├── ScoringChart.jsx
│   │   │   └── TimingChart.jsx
│   │   │
│   │   └── layout/
│   │       ├── Navigation.jsx
│   │       ├── Header.jsx
│   │       └── Layout.jsx
│   │
│   ├── context/
│   │   ├── AppContext.jsx     # Global state provider
│   │   └── MatchContext.jsx   # Active match state
│   │
│   ├── hooks/
│   │   ├── useTimer.js        # Match timer logic
│   │   ├── useStorage.js      # localStorage abstraction
│   │   └── useStats.js        # Statistics calculations
│   │
│   ├── utils/
│   │   ├── storage.js         # Persistence helpers
│   │   ├── stats.js           # Statistical calculations
│   │   ├── export.js          # CSV/PDF export
│   │   └── constants.js       # Waza types, targets, etc.
│   │
│   ├── data/
│   │   └── sampleData.js      # Demo/seed data
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Tailwind imports + custom
│
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

### 6.3 Key Custom Hooks

```javascript
// useTimer.js - Match timer with pause/resume
function useTimer() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  
  const start = () => { /* ... */ };
  const pause = () => { /* ... */ };
  const reset = () => { /* ... */ };
  const getTimestamp = () => time;
  
  return { time, isRunning, start, pause, reset, getTimestamp };
}

// useStats.js - Calculate player/team statistics
function useStats(matches, playerId = null) {
  return useMemo(() => {
    // Filter matches for player if specified
    // Calculate win/loss record
    // Aggregate scoring by target and waza
    // Calculate timing distributions
    return { record, scoring, conceded, wazaStats, timing };
  }, [matches, playerId]);
}
```

---

## 7. Implementation Phases

### Phase 1: MVP (Week 1-2)
- [ ] Project setup (Vite, React, Tailwind)
- [ ] Basic navigation and layout
- [ ] Player management (CRUD)
- [ ] Match recording with timer
- [ ] Score logging (basic: target + scorer)
- [ ] Match history list
- [ ] localStorage persistence

### Phase 2: Analytics (Week 3)
- [ ] Player statistics dashboard
- [ ] Team statistics dashboard
- [ ] Scoring distribution charts
- [ ] Timing analysis charts
- [ ] Win/loss trends

### Phase 3: Enhanced Features (Week 4)
- [ ] Waza categorization in scoring
- [ ] Match notes and annotations
- [ ] CSV export functionality
- [ ] PWA setup (offline, installable)
- [ ] Opponent database

### Phase 4: Polish (Week 5+)
- [ ] Video timestamp integration
- [ ] PDF report generation
- [ ] Cloud sync (optional)
- [ ] Performance optimization
- [ ] User testing and refinement

---

## 8. Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Time to record ippon | < 3 seconds | User testing |
| Data accuracy | 100% | Verify recordings match actual |
| Offline reliability | Works fully offline | PWA testing |
| Load time | < 2 seconds | Lighthouse audit |
| User adoption | Team uses for all matches | Usage tracking |

---

## 9. Open Questions for Discussion

1. **Multi-language support?** - Should the app support Japanese terminology toggles?

2. **Team match scoring?** - Do you need to track 5-person team matches (senpo through taisho) as a unit?

3. **Video integration priority?** - How important is linking video clips to timestamps?

4. **Sharing/collaboration?** - Do multiple people need to access the same data simultaneously?

5. **Historical data import?** - Is there existing data (spreadsheets, etc.) to migrate?

---

## 10. Next Steps

1. **Review this plan** - Provide feedback on features and priorities
2. **Confirm tech choices** - Any preferences or constraints?
3. **Begin MVP development** - Start with match recording core
4. **Iterative testing** - Get feedback from actual users early

---

*Document created: January 2026*
*For: Team Canada Women's Kendo*
