import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, Target, Users, TrendingUp, Calendar,
  ChevronRight, BarChart3
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { SCORERS, TARGET_LABELS, formatDate } from '../../utils/constants';
import { calculateTeamStats, calculateTeamMatchStats, getScoringDistribution } from '../../utils/stats';

const CHART_COLORS = {
  men: '#c41e3a',
  kote: '#2563eb',
  do: '#16a34a',
  tsuki: '#9333ea',
};

function AnalyticsPage() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('team'); // team, players, trends

  const teamStats = useMemo(() => calculateTeamStats(state.matches), [state.matches]);
  const teamMatchStats = useMemo(() => calculateTeamMatchStats(state.teamMatches), [state.teamMatches]);

  // Prepare chart data
  const scoringData = teamStats.ipponsScored.total > 0 
    ? Object.entries(teamStats.ipponsScored)
        .filter(([key]) => key !== 'total')
        .map(([target, count]) => ({
          name: TARGET_LABELS[target] || target,
          value: count,
          color: CHART_COLORS[target],
        }))
        .filter(d => d.value > 0)
    : [];

  const concededData = teamStats.ipponsConceded.total > 0
    ? Object.entries(teamStats.ipponsConceded)
        .filter(([key]) => key !== 'total')
        .map(([target, count]) => ({
          name: TARGET_LABELS[target] || target,
          value: count,
          color: CHART_COLORS[target],
        }))
        .filter(d => d.value > 0)
    : [];

  // Calculate player rankings
  const playerRankings = useMemo(() => {
    return state.players.map(player => {
      const matches = state.matches.filter(m => 
        m.tcwPlayerId === player.id || m.tcwPlayer?.id === player.id
      );
      const wins = matches.filter(m => m.result === 'win').length;
      const totalIppons = matches.reduce((sum, m) => 
        sum + (m.scores?.filter(s => s.scorer === SCORERS.TCW).length || 0), 0
      );
      return {
        ...player,
        matches: matches.length,
        wins,
        losses: matches.filter(m => m.result === 'loss').length,
        winRate: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
        totalIppons,
      };
    }).sort((a, b) => b.winRate - a.winRate || b.wins - a.wins);
  }, [state.players, state.matches]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const months = {};
    state.matches.forEach(match => {
      const date = new Date(match.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!months[key]) {
        months[key] = { month: key, wins: 0, losses: 0, draws: 0 };
      }
      if (match.result === 'win') months[key].wins++;
      else if (match.result === 'loss') months[key].losses++;
      else months[key].draws++;
    });
    return Object.values(months).sort((a, b) => a.month.localeCompare(b.month)).slice(-6);
  }, [state.matches]);

  if (state.matches.length === 0 && state.teamMatches.length === 0) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-kendo-cream mb-6">Analytics</h1>
        <div className="card text-center py-8">
          <BarChart3 className="w-12 h-12 text-kendo-cream/30 mx-auto mb-4" />
          <p className="text-kendo-cream/60 mb-2">No match data yet</p>
          <p className="text-sm text-kendo-cream/40 mb-4">
            Record some matches to see analytics
          </p>
          <Link to="/record" className="btn btn-primary">
            Record a Match
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl mx-auto pb-20">
      <h1 className="text-xl font-semibold text-kendo-cream mb-4">Analytics</h1>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['team', 'players', 'trends'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-kendo-red text-white'
                : 'bg-kendo-navy-light text-kendo-cream/60 hover:text-kendo-cream'
            }`}
          >
            {tab === 'team' && 'Team Stats'}
            {tab === 'players' && 'Player Rankings'}
            {tab === 'trends' && 'Trends'}
          </button>
        ))}
      </div>

      {/* Team Stats Tab */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          {/* Overall Record */}
          <div className="card">
            <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4">Overall Record</h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-3xl font-bold text-kendo-cream">{teamStats.totalMatches}</p>
                <p className="text-xs text-kendo-cream/60">Matches</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-green-400">{teamStats.wins}</p>
                <p className="text-xs text-kendo-cream/60">Wins</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-400">{teamStats.losses}</p>
                <p className="text-xs text-kendo-cream/60">Losses</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-kendo-gold">{teamStats.winRate}%</p>
                <p className="text-xs text-kendo-cream/60">Win Rate</p>
              </div>
            </div>
          </div>

          {/* Team Matches Record */}
          {state.teamMatches.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4">Team Match Record (5v5)</h3>
              <div className="grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-kendo-cream">{teamMatchStats.totalMatches}</p>
                  <p className="text-xs text-kendo-cream/60">Matches</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{teamMatchStats.wins}</p>
                  <p className="text-xs text-kendo-cream/60">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{teamMatchStats.losses}</p>
                  <p className="text-xs text-kendo-cream/60">Losses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-kendo-gold">{teamMatchStats.winRate}%</p>
                  <p className="text-xs text-kendo-cream/60">Win Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Scoring Distribution */}
          {scoringData.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">
                Ippons Scored ({teamStats.ipponsScored.total} total)
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={scoringData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {scoringData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#252542',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f5f5f0'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Conceded Distribution */}
          {concededData.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">
                Ippons Conceded ({teamStats.ipponsConceded.total} total)
              </h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={concededData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {concededData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={0.6} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#252542',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f5f5f0'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Players Tab */}
      {activeTab === 'players' && (
        <div className="space-y-4">
          {playerRankings.length === 0 ? (
            <div className="card text-center py-6">
              <Users className="w-10 h-10 text-kendo-cream/30 mx-auto mb-3" />
              <p className="text-kendo-cream/60">No players with match data</p>
            </div>
          ) : (
            <>
              {/* Top Performers */}
              <div className="card">
                <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Player Rankings</h3>
                <div className="space-y-2">
                  {playerRankings.map((player, idx) => (
                    <Link
                      key={player.id}
                      to={`/players/${player.id}`}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-kendo-navy transition-colors"
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                        idx === 0 ? 'bg-kendo-gold text-kendo-navy' :
                        idx === 1 ? 'bg-gray-300 text-kendo-navy' :
                        idx === 2 ? 'bg-amber-700 text-white' :
                        'bg-kendo-gray text-kendo-cream'
                      }`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-kendo-cream truncate">
                          {player.name}
                        </p>
                        <p className="text-xs text-kendo-cream/50">
                          {player.matches} matches • {player.totalIppons} ippons
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-mono ${
                          player.winRate >= 60 ? 'text-green-400' :
                          player.winRate >= 40 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {player.winRate}%
                        </p>
                        <p className="text-xs text-kendo-cream/40">
                          {player.wins}W-{player.losses}L
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-kendo-cream/30" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Top Scorers */}
              {teamStats.topScorers.length > 0 && (
                <div className="card">
                  <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Top Scorers</h3>
                  <div className="space-y-2">
                    {teamStats.topScorers.map((player, idx) => (
                      <div
                        key={player.id}
                        className="flex items-center gap-3 p-2"
                      >
                        <span className="text-kendo-cream/40 text-sm w-4">{idx + 1}</span>
                        <div className="flex-1">
                          <p className="text-sm text-kendo-cream">{player.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-kendo-red" />
                          <span className="text-sm font-mono text-kendo-cream">
                            {player.ippons}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <div className="space-y-6">
          {/* Monthly Trend */}
          {monthlyTrend.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Monthly Performance</h3>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyTrend}>
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: '#a0a0b0', fontSize: 10 }}
                      axisLine={{ stroke: '#4a4a5a' }}
                    />
                    <YAxis 
                      tick={{ fill: '#a0a0b0', fontSize: 10 }}
                      axisLine={{ stroke: '#4a4a5a' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#252542',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f5f5f0'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="wins" fill="#22c55e" name="Wins" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="losses" fill="#ef4444" name="Losses" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Form */}
          {teamStats.scoringTrend.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">
                Recent Form (Last 10 Matches)
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={teamStats.scoringTrend}>
                    <XAxis 
                      dataKey="match" 
                      tick={{ fill: '#a0a0b0', fontSize: 10 }}
                      axisLine={{ stroke: '#4a4a5a' }}
                    />
                    <YAxis 
                      tick={{ fill: '#a0a0b0', fontSize: 10 }}
                      axisLine={{ stroke: '#4a4a5a' }}
                      allowDecimals={false}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#252542',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#f5f5f0'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="scored" 
                      stroke="#c41e3a" 
                      name="Scored"
                      strokeWidth={2}
                      dot={{ fill: '#c41e3a' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="conceded" 
                      stroke="#d4a017" 
                      name="Conceded"
                      strokeWidth={2}
                      dot={{ fill: '#d4a017' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Win Streak Info */}
          <div className="card">
            <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-kendo-cream/50 mb-1">Avg Ippons/Match</p>
                <p className="text-xl font-bold text-kendo-cream">
                  {teamStats.totalMatches > 0 
                    ? (teamStats.ipponsScored.total / teamStats.totalMatches).toFixed(1)
                    : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-kendo-cream/50 mb-1">Avg Conceded/Match</p>
                <p className="text-xl font-bold text-kendo-cream">
                  {teamStats.totalMatches > 0 
                    ? (teamStats.ipponsConceded.total / teamStats.totalMatches).toFixed(1)
                    : '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-kendo-cream/50 mb-1">Total Ippons</p>
                <p className="text-xl font-bold text-green-400">{teamStats.ipponsScored.total}</p>
              </div>
              <div>
                <p className="text-xs text-kendo-cream/50 mb-1">Total Conceded</p>
                <p className="text-xl font-bold text-red-400">{teamStats.ipponsConceded.total}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnalyticsPage;
