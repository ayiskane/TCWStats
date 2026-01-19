import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Target, Users, TrendingUp, TrendingDown,
  BarChart3, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { calculateTeamStats, calculateTeamMatchStats, getScoringDistribution } from '../../utils/stats';

const COLORS = {
  men: '#c41e3a',
  kote: '#2563eb',
  do: '#16a34a',
  tsuki: '#9333ea',
};

function AnalyticsPage() {
  const { state } = useApp();

  const teamStats = useMemo(() => 
    calculateTeamStats(state.matches),
    [state.matches]
  );

  const teamMatchStats = useMemo(() => 
    calculateTeamMatchStats(state.teamMatches),
    [state.teamMatches]
  );

  const scoringDist = getScoringDistribution(teamStats.ipponsScored);
  const concededDist = getScoringDistribution(teamStats.ipponsConceded);

  const scoringPieData = Object.entries(scoringDist)
    .filter(([key]) => key !== 'total')
    .map(([name, value]) => ({ name: name.toUpperCase(), value }))
    .filter(d => d.value > 0);

  const positionData = Object.entries(teamMatchStats.positionStats).map(([pos, stats]) => ({
    position: pos.charAt(0).toUpperCase() + pos.slice(1),
    wins: stats.wins,
    losses: stats.losses,
    draws: stats.draws,
  }));

  if (state.matches.length === 0 && state.teamMatches.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-kendo-cream mb-6">Analytics</h1>
        <div className="card text-center py-8">
          <BarChart3 className="w-12 h-12 text-kendo-cream/30 mx-auto mb-4" />
          <p className="text-kendo-cream/60 mb-2">No data to analyze yet</p>
          <p className="text-sm text-kendo-cream/40 mb-4">
            Start recording matches to see team statistics
          </p>
          <Link to="/record" className="btn btn-primary">
            Record First Match
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-8">
      <h1 className="text-xl font-semibold text-kendo-cream mb-6">Team Analytics</h1>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center">
          <Trophy className="w-6 h-6 text-kendo-gold mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">
            {teamStats.wins}-{teamStats.losses}
          </p>
          <p className="text-xs text-kendo-cream/60">Individual Record</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">{teamStats.winRate}%</p>
          <p className="text-xs text-kendo-cream/60">Win Rate</p>
        </div>
        <div className="card text-center">
          <Target className="w-6 h-6 text-kendo-red mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">{teamStats.ipponsScored.total}</p>
          <p className="text-xs text-kendo-cream/60">Ippons Scored</p>
        </div>
        <div className="card text-center">
          <Target className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">{teamStats.ipponsConceded.total}</p>
          <p className="text-xs text-kendo-cream/60">Ippons Conceded</p>
        </div>
      </div>

      {/* Team Match Stats */}
      {state.teamMatches.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Team Match Record
          </h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-bold text-green-400">{teamMatchStats.wins}</p>
              <p className="text-xs text-kendo-cream/60">Wins</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">{teamMatchStats.losses}</p>
              <p className="text-xs text-kendo-cream/60">Losses</p>
            </div>
            <div>
              <p className="text-xl font-bold text-yellow-400">{teamMatchStats.draws}</p>
              <p className="text-xs text-kendo-cream/60">Draws</p>
            </div>
          </div>
        </div>
      )}

      {/* Scoring Distribution */}
      {teamStats.ipponsScored.total > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4" />
            Scoring Distribution
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoringPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={50}
                    dataKey="value"
                  >
                    {scoringPieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[entry.name.toLowerCase()]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2">
              {Object.entries(teamStats.ipponsScored)
                .filter(([key]) => key !== 'total')
                .sort(([,a], [,b]) => b - a)
                .map(([target, count]) => (
                  <div key={target} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[target] }}
                    />
                    <span className="text-sm text-kendo-cream uppercase flex-1">{target}</span>
                    <span className="text-sm text-kendo-cream/60">{count}</span>
                    <span className="text-xs text-kendo-cream/40 w-12 text-right">
                      {scoringDist[target]}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Points Conceded */}
      {teamStats.ipponsConceded.total > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" />
            Points Conceded By Target
          </h3>
          <div className="space-y-2">
            {Object.entries(teamStats.ipponsConceded)
              .filter(([key]) => key !== 'total')
              .sort(([,a], [,b]) => b - a)
              .map(([target, count]) => (
                <div key={target} className="flex items-center gap-2">
                  <span className="text-sm text-kendo-cream uppercase w-12">{target}</span>
                  <div className="flex-1 bg-kendo-navy rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full transition-all"
                      style={{ 
                        width: `${concededDist[target]}%`,
                        backgroundColor: COLORS[target]
                      }}
                    />
                  </div>
                  <span className="text-sm text-kendo-cream/60 w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Scoring Trend */}
      {teamStats.scoringTrend.length > 2 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4">
            Recent Performance (Last 10 Matches)
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={teamStats.scoringTrend}>
                <XAxis 
                  dataKey="match" 
                  tick={{ fill: '#f5f5f0', fontSize: 10 }}
                  axisLine={{ stroke: '#4a4a5a' }}
                />
                <YAxis 
                  tick={{ fill: '#f5f5f0', fontSize: 10 }}
                  axisLine={{ stroke: '#4a4a5a' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#252542', 
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="scored" 
                  stroke="#16a34a" 
                  strokeWidth={2}
                  dot={{ fill: '#16a34a' }}
                  name="Scored"
                />
                <Line 
                  type="monotone" 
                  dataKey="conceded" 
                  stroke="#dc2626" 
                  strokeWidth={2}
                  dot={{ fill: '#dc2626' }}
                  name="Conceded"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Position Performance */}
      {positionData.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4">
            Performance by Position
          </h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={positionData} layout="vertical">
                <XAxis type="number" tick={{ fill: '#f5f5f0', fontSize: 10 }} />
                <YAxis 
                  type="category" 
                  dataKey="position" 
                  tick={{ fill: '#f5f5f0', fontSize: 10 }}
                  width={60}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#252542', 
                    border: 'none',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="wins" fill="#16a34a" stackId="a" name="Wins" />
                <Bar dataKey="losses" fill="#dc2626" stackId="a" name="Losses" />
                <Bar dataKey="draws" fill="#eab308" stackId="a" name="Draws" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Scorers */}
      {teamStats.topScorers.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">
            Top Scorers
          </h3>
          <div className="space-y-2">
            {teamStats.topScorers.map((scorer, idx) => (
              <Link
                key={scorer.id}
                to={`/players/${scorer.id}`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-kendo-navy transition-colors"
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                  idx === 0 ? 'bg-kendo-gold text-kendo-navy' :
                  idx === 1 ? 'bg-gray-400 text-kendo-navy' :
                  idx === 2 ? 'bg-amber-700 text-white' :
                  'bg-kendo-gray text-kendo-cream'
                }`}>
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm text-kendo-cream">{scorer.name}</span>
                <span className="text-sm font-mono text-kendo-gold">{scorer.ippons} ippons</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 flex gap-3">
        <Link to="/players" className="btn btn-outline flex-1 text-center">
          View All Players
        </Link>
        <Link to="/history" className="btn btn-outline flex-1 text-center">
          Match History
        </Link>
      </div>
    </div>
  );
}

export default AnalyticsPage;
