import { TARGETS, WAZA, SCORERS, MATCH_RESULTS } from './constants';

// Calculate player statistics from matches
export const calculatePlayerStats = (matches, playerId) => {
  const playerMatches = matches.filter(m => 
    m.tcwPlayerId === playerId || m.tcwPlayer?.id === playerId
  );
  
  if (playerMatches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      ipponsScored: { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 },
      ipponsConceded: { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 },
      wazaStats: {},
      scoringByMinute: [],
      averageScoreTime: 0,
    };
  }
  
  // Win/loss record
  const wins = playerMatches.filter(m => m.result === MATCH_RESULTS.WIN).length;
  const losses = playerMatches.filter(m => m.result === MATCH_RESULTS.LOSS).length;
  const draws = playerMatches.filter(m => m.result === MATCH_RESULTS.DRAW).length;
  
  // Scoring breakdown
  const ipponsScored = { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 };
  const ipponsConceded = { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 };
  const wazaStats = {};
  const scoreTimes = [];
  const scoringByMinute = [0, 0, 0, 0, 0, 0]; // 6 minute buckets
  
  playerMatches.forEach(match => {
    match.scores?.forEach(score => {
      if (score.scorer === SCORERS.TCW) {
        ipponsScored[score.target]++;
        ipponsScored.total++;
        
        // Track waza usage
        if (score.waza) {
          if (!wazaStats[score.waza]) {
            wazaStats[score.waza] = { successful: 0, total: 0 };
          }
          wazaStats[score.waza].successful++;
          wazaStats[score.waza].total++;
        }
        
        // Track timing
        scoreTimes.push(score.timestamp);
        const minute = Math.min(5, Math.floor(score.timestamp / 60000));
        scoringByMinute[minute]++;
      } else {
        ipponsConceded[score.target]++;
        ipponsConceded.total++;
      }
    });
  });
  
  return {
    totalMatches: playerMatches.length,
    wins,
    losses,
    draws,
    winRate: playerMatches.length > 0 ? Math.round((wins / playerMatches.length) * 100) : 0,
    ipponsScored,
    ipponsConceded,
    wazaStats,
    scoringByMinute,
    averageScoreTime: scoreTimes.length > 0 
      ? Math.round(scoreTimes.reduce((a, b) => a + b, 0) / scoreTimes.length)
      : 0,
  };
};

// Calculate team statistics from all matches
export const calculateTeamStats = (matches) => {
  if (matches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      ipponsScored: { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 },
      ipponsConceded: { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 },
      scoringTrend: [],
      topScorers: [],
    };
  }
  
  const wins = matches.filter(m => m.result === MATCH_RESULTS.WIN).length;
  const losses = matches.filter(m => m.result === MATCH_RESULTS.LOSS).length;
  const draws = matches.filter(m => m.result === MATCH_RESULTS.DRAW).length;
  
  const ipponsScored = { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 };
  const ipponsConceded = { men: 0, kote: 0, do: 0, tsuki: 0, total: 0 };
  const playerScores = {};
  
  matches.forEach(match => {
    const playerId = match.tcwPlayerId || match.tcwPlayer?.id;
    if (playerId && !playerScores[playerId]) {
      playerScores[playerId] = {
        id: playerId,
        name: match.tcwPlayer?.name || 'Unknown',
        ippons: 0,
      };
    }
    
    match.scores?.forEach(score => {
      if (score.scorer === SCORERS.TCW) {
        ipponsScored[score.target]++;
        ipponsScored.total++;
        if (playerId) {
          playerScores[playerId].ippons++;
        }
      } else {
        ipponsConceded[score.target]++;
        ipponsConceded.total++;
      }
    });
  });
  
  // Calculate scoring trend (last 10 matches)
  const recentMatches = [...matches]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)
    .reverse();
  
  const scoringTrend = recentMatches.map((match, index) => ({
    match: index + 1,
    scored: match.scores?.filter(s => s.scorer === SCORERS.TCW).length || 0,
    conceded: match.scores?.filter(s => s.scorer === SCORERS.OPPONENT).length || 0,
    date: match.date,
  }));
  
  // Top scorers
  const topScorers = Object.values(playerScores)
    .sort((a, b) => b.ippons - a.ippons)
    .slice(0, 5);
  
  return {
    totalMatches: matches.length,
    wins,
    losses,
    draws,
    winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
    ipponsScored,
    ipponsConceded,
    scoringTrend,
    topScorers,
  };
};

// Calculate team match statistics
export const calculateTeamMatchStats = (teamMatches) => {
  if (teamMatches.length === 0) {
    return {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      positionStats: {},
    };
  }
  
  const wins = teamMatches.filter(m => m.result === MATCH_RESULTS.WIN).length;
  const losses = teamMatches.filter(m => m.result === MATCH_RESULTS.LOSS).length;
  const draws = teamMatches.filter(m => m.result === MATCH_RESULTS.DRAW).length;
  
  // Stats by position
  const positionStats = {};
  
  teamMatches.forEach(teamMatch => {
    teamMatch.bouts?.forEach(bout => {
      if (!positionStats[bout.position]) {
        positionStats[bout.position] = { wins: 0, losses: 0, draws: 0, total: 0 };
      }
      positionStats[bout.position].total++;
      if (bout.result === MATCH_RESULTS.WIN) positionStats[bout.position].wins++;
      else if (bout.result === MATCH_RESULTS.LOSS) positionStats[bout.position].losses++;
      else positionStats[bout.position].draws++;
    });
  });
  
  return {
    totalMatches: teamMatches.length,
    wins,
    losses,
    draws,
    winRate: teamMatches.length > 0 ? Math.round((wins / teamMatches.length) * 100) : 0,
    positionStats,
  };
};

// Get scoring distribution as percentages
export const getScoringDistribution = (ipponsScored) => {
  const total = ipponsScored.total || 1; // Avoid division by zero
  return {
    men: Math.round((ipponsScored.men / total) * 100),
    kote: Math.round((ipponsScored.kote / total) * 100),
    do: Math.round((ipponsScored.do / total) * 100),
    tsuki: Math.round((ipponsScored.tsuki / total) * 100),
  };
};

// Get match result based on scores
export const determineMatchResult = (scores, format = 'sanbon') => {
  const tcwScore = scores.filter(s => s.scorer === SCORERS.TCW).length;
  const oppScore = scores.filter(s => s.scorer === SCORERS.OPPONENT).length;
  const winningScore = format === 'sanbon' ? 2 : 1;
  
  if (tcwScore >= winningScore) return MATCH_RESULTS.WIN;
  if (oppScore >= winningScore) return MATCH_RESULTS.LOSS;
  if (tcwScore === oppScore && tcwScore > 0) return MATCH_RESULTS.DRAW;
  return MATCH_RESULTS.IN_PROGRESS;
};

// Get insights for a player
export const getPlayerInsights = (stats) => {
  const insights = [];
  
  // Strength analysis
  if (stats.ipponsScored.total > 0) {
    const distribution = getScoringDistribution(stats.ipponsScored);
    const maxTarget = Object.entries(distribution)
      .filter(([key]) => key !== 'total')
      .sort(([,a], [,b]) => b - a)[0];
    
    if (maxTarget && maxTarget[1] > 40) {
      insights.push({
        type: 'strength',
        message: `Strong ${maxTarget[0].toUpperCase()} player - ${maxTarget[1]}% of ippons`,
      });
    }
  }
  
  // Vulnerability analysis
  if (stats.ipponsConceded.total > 0) {
    const concededDist = getScoringDistribution(stats.ipponsConceded);
    const maxConceded = Object.entries(concededDist)
      .filter(([key]) => key !== 'total')
      .sort(([,a], [,b]) => b - a)[0];
    
    if (maxConceded && maxConceded[1] > 50) {
      insights.push({
        type: 'vulnerability',
        message: `Vulnerable to ${maxConceded[0].toUpperCase()} - ${maxConceded[1]}% of ippons conceded`,
      });
    }
  }
  
  // Timing analysis
  if (stats.scoringByMinute?.length > 0) {
    const totalScores = stats.scoringByMinute.reduce((a, b) => a + b, 0);
    if (totalScores > 0) {
      const firstHalf = stats.scoringByMinute.slice(0, 3).reduce((a, b) => a + b, 0);
      const secondHalf = stats.scoringByMinute.slice(3).reduce((a, b) => a + b, 0);
      
      if (firstHalf > secondHalf * 1.5) {
        insights.push({
          type: 'timing',
          message: `Fast starter - scores more in first half of matches`,
        });
      } else if (secondHalf > firstHalf * 1.5) {
        insights.push({
          type: 'timing',
          message: `Strong finisher - scores more in second half of matches`,
        });
      }
    }
  }
  
  // Win rate insight
  if (stats.totalMatches >= 5) {
    if (stats.winRate >= 70) {
      insights.push({
        type: 'performance',
        message: `Excellent record with ${stats.winRate}% win rate`,
      });
    } else if (stats.winRate <= 30) {
      insights.push({
        type: 'attention',
        message: `Needs improvement - ${stats.winRate}% win rate`,
      });
    }
  }
  
  return insights;
};
