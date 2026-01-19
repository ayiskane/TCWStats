# TCWStats - Team Canada Women's Kendo Statistics Tracker

A sport science analytics application designed for tracking kendo match statistics, ippons, and performance analysis.

![TCWStats](https://img.shields.io/badge/TCWStats-v1.0.0-red)
![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-purple)

## Features

### 🎯 Match Recording
- **Individual Matches**: Track 1v1 bouts with real-time timer
- **Team Matches (5v5)**: Record full team matches with all positions (Senpo → Taisho)
- **Quick Scoring**: Large touch targets for fast ippon recording
- **Waza Tracking**: Optionally record technique used for each ippon

### 📊 Analytics
- **Player Statistics**: Win/loss records, scoring distribution, timing analysis
- **Team Analytics**: Overall performance, trends, top scorers
- **Visual Charts**: Pie charts for scoring breakdown, bar charts for timing

### 🎬 Video Integration
- Link match recordings to video URLs
- Timestamp reference for reviewing specific ippons

### 📱 Mobile-First Design
- Optimized for use at practice and tournaments
- Large touch targets for reliable input during matches
- Works offline with local storage

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/ayiskane/TCWStats.git
cd TCWStats

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Usage Guide

### Recording an Individual Match

1. Go to **Record** → **Individual Match**
2. Select the TCW player and enter opponent info
3. Tap **Start Match** to begin
4. When an ippon is scored:
   - Tap the target button (Men/Kote/Do/Tsuki)
   - Select who scored (TCW or Opponent)
   - Optionally select the waza used
5. Tap **End Match** when finished

### Recording a Team Match

1. Go to **Record** → **Team Match (5v5)**
2. Enter opponent team name
3. Assign TCW players to each position
4. Record each bout from Senpo to Taisho
5. View final team score and bout results

### Analyzing Performance

- **History**: View all recorded matches with filtering
- **Analytics**: See team and player statistics with charts
- **Player Profiles**: Individual performance breakdowns

## Data Structure

### Scoring Targets (Datotsu-bui)
| Target | Japanese | Description |
|--------|----------|-------------|
| Men | 面 | Head strike |
| Kote | 小手 | Wrist strike |
| Do | 胴 | Torso strike |
| Tsuki | 突き | Throat thrust |

### Techniques (Waza)
**Shikake-waza (Attacking)**
- Ippon-uchi, Renzoku, Harai, Debana, Hiki

**Oji-waza (Counter)**
- Nuki, Suriage, Kaeshi, Uchiotoshi

### Team Positions
1. Senpo (先鋒) - 1st position
2. Jiho (次鋒) - 2nd position
3. Chuken (中堅) - 3rd position
4. Fukusho (副将) - 4th position
5. Taisho (大将) - 5th position

## Data Export

TCWStats supports exporting your data:
- **JSON Export**: Full backup of all data
- **CSV Export**: Match data for spreadsheet analysis

Go to **Settings** → **Data Management** to export.

## Technology Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: localStorage (cloud sync coming soon)

## Roadmap

- [ ] Cloud sync with Supabase
- [ ] Multi-device collaboration
- [ ] Video timestamp sync
- [ ] PDF report generation
- [ ] PWA offline support

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this for your kendo team!

---

Built with ❤️ for Team Canada Women's Kendo
