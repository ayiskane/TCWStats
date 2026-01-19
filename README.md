# TCWStats - Team Canada Women's Kendo Statistics Tracker

A sport science analytics application for tracking ippons, analyzing performance patterns, and improving team results.

## Features

### 🎯 Match Recording
- **Individual Matches**: Track 1v1 bouts with precise timestamp recording
- **Team Matches (5v5)**: Record full team matches through all 5 positions
- **Live Timer**: Start/pause/reset with millisecond precision
- **Quick Score Buttons**: Large touch targets for Men, Kote, Do, Tsuki
- **Waza Tracking**: Optional technique categorization (Shikake-waza & Oji-waza)
- **Video Integration**: Link timestamps to video recordings

### 📊 Analytics Dashboard
- Win/loss records and win rates
- Scoring distribution charts (by target)
- Timing analysis (when players tend to score)
- Points conceded breakdown (vulnerabilities)
- Team performance by position
- Top scorer rankings

### 👥 Player Management
- Team roster with positions (Senpo through Taisho)
- Individual player statistics
- Performance insights per player

### 💾 Data Management
- Local storage (works offline)
- JSON export/import for backup
- CSV export for external analysis

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Recharts
- React Router v6

## Kendo Terminology

| Term | Meaning |
|------|---------|
| **Men** | Head strike |
| **Kote** | Wrist strike |
| **Do** | Torso strike |
| **Tsuki** | Throat thrust |
| **Ippon** | Valid point |

### Team Positions
1. Senpo (First)
2. Jiho (Second)
3. Chuken (Middle)
4. Fukusho (Fourth)
5. Taisho (Captain)

---
Built for Team Canada Women's Kendo
