import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronLeft, Edit2, Trash2, Trophy, Target, Clock,
  TrendingUp, AlertTriangle, Zap, Save, X
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { POSITION_LABELS, formatDate, formatTime } from '../../utils/constants';
import { calculatePlayerStats, getScoringDistribution, getPlayerInsights } from '../../utils/stats';

const COLORS = {
  men: '#c41e3a',
  kote: '#2563eb',
  do: '#16a34a',
  tsuki: '#9333ea',
};

function PlayerDetail() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const { state, updatePlayer, deletePlayer } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', position: '', notes: '' });

  const player = state.players.find(p => p.id === playerId);
  const stats = useMemo(() => 
    player ? calculatePlayerStats(state.matches, playerId) : null,
    [state.matches, playerId, player]
  );

  const playerMatches = useMemo(() => 
    state.matches
      .filter(m => m.tcwPlayerId === playerId)
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [state.matches, playerId]
  );

  if (!player || !stats) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="card text-center py-8">
          <p className="text-kendo-cream/60 mb-4">Player not found</p>
          <button onClick={() => navigate('/players')} className="btn btn-primary">
            Back to Roster
          </button>
        </div>
      </div>
    );
  }

  const insights = getPlayerInsights(stats);
  const scoringDist = getScoringDistribution(stats.ipponsScored);
  const concededDist = getScoringDistribution(stats.ipponsConceded);

  // Prepare chart data
  const scoringPieData = Object.entries(scoringDist)
    .filter(([key]) => key !== 'total')
    .map(([name, value]) => ({ name: name.toUpperCase(), value }))
    .filter(d => d.value > 0);

  const timingBarData = stats.scoringByMinute.map((count, idx) => ({
    minute: `${idx}-${idx + 1}`,
    ippons: count,
  }));

  const handleStartEdit = () => {
    setEditForm({
      name: player.name,
      position: player.position || '',
      notes: player.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.name.trim()) {
      alert('Please enter a name');
      return;
    }
    updatePlayer({
      ...player,
      name: editForm.name.trim(),
      position: editForm.position || null,
      notes: editForm.notes,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!confirm(`Delete ${player.name}? Their match history will remain but won't be linked.`)) return;
    deletePlayer(playerId);
    navigate('/players');
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/players')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-kendo-cream" />
        </button>
        <h1 className="text-xl font-semibold text-kendo-cream flex-1">Player Profile</h1>
        <button
          onClick={handleStartEdit}
          className="p-2 text-kendo-cream/60 hover:text-kendo-cream"
        >
          <Edit2 className="w-5 h-5" />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Player Info Card */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-kendo-red/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-kendo-red">
              {player.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-kendo-cream">{player.name}</h2>
            <p className="text-sm text-kendo-cream/60">
              {player.position ? POSITION_LABELS[player.position] : 'No position set'}
            </p>
          </div>
        </div>
        {player.notes && (
          <p className="mt-4 text-sm text-kendo-cream/70 border-t border-kendo-gray/20 pt-4">
            {player.notes}
          </p>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="card text-center">
          <Trophy className="w-6 h-6 text-kendo-gold mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">
            {stats.wins}-{stats.losses}
            {stats.draws > 0 && <span className="text-lg">-{stats.draws}</span>}
          </p>
          <p className="text-xs text-kendo-cream/60">Win-Loss Record</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">{stats.winRate}%</p>
          <p className="text-xs text-kendo-cream/60">Win Rate</p>
        </div>
        <div className="card text-center">
          <Target className="w-6 h-6 text-kendo-red mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">{stats.ipponsScored.total}</p>
          <p className="text-xs text-kendo-cream/60">Ippons Scored</p>
        </div>
        <div className="card text-center">
          <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-kendo-cream">
            {stats.averageScoreTime > 0 
              ? formatTime(stats.averageScoreTime).formatted.slice(0, 5)
              : '--:--'}
          </p>
          <p className="text-xs text-kendo-cream/60">Avg Score Time</p>
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Insights
          </h3>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-2 rounded-lg ${
                  insight.type === 'strength' ? 'bg-green-600/10' :
                  insight.type === 'vulnerability' ? 'bg-red-600/10' :
                  insight.type === 'attention' ? 'bg-yellow-600/10' :
                  'bg-kendo-navy'
                }`}
              >
                {insight.type === 'vulnerability' || insight.type === 'attention' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Zap className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <p className="text-sm text-kendo-cream">{insight.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Distribution */}
      {stats.ipponsScored.total > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4">Scoring Breakdown</h3>
          <div className="flex items-center gap-4">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={scoringPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={45}
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
              {Object.entries(stats.ipponsScored)
                .filter(([key]) => key !== 'total')
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
      {stats.ipponsConceded.total > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Points Conceded</h3>
          <div className="space-y-2">
            {Object.entries(stats.ipponsConceded)
              .filter(([key]) => key !== 'total')
              .sort(([,a], [,b]) => b - a)
              .map(([target, count]) => (
                <div key={target} className="flex items-center gap-2">
                  <span className="text-sm text-kendo-cream uppercase w-12">{target}</span>
                  <div className="flex-1 bg-kendo-navy rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-red-500"
                      style={{ width: `${concededDist[target]}%` }}
                    />
                  </div>
                  <span className="text-sm text-kendo-cream/60 w-8 text-right">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Timing Distribution */}
      {stats.ipponsScored.total > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-4">When They Score</h3>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timingBarData}>
                <XAxis 
                  dataKey="minute" 
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
                  labelStyle={{ color: '#f5f5f0' }}
                />
                <Bar dataKey="ippons" fill="#c41e3a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-kendo-cream/40 text-center mt-2">
            Ippons scored by minute of match
          </p>
        </div>
      )}

      {/* Recent Matches */}
      {playerMatches.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Recent Matches</h3>
          <div className="space-y-2">
            {playerMatches.slice(0, 5).map(match => {
              const tcwScore = match.scores?.filter(s => s.scorer === 'tcw').length || 0;
              const oppScore = match.scores?.filter(s => s.scorer === 'opponent').length || 0;
              
              return (
                <Link
                  key={match.id}
                  to={`/history/${match.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-kendo-navy transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full ${
                    match.result === 'win' ? 'bg-green-500' :
                    match.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm text-kendo-cream/60">
                    {formatDate(match.date)}
                  </span>
                  <span className="flex-1 text-sm text-kendo-cream truncate">
                    vs {match.opponent?.name || 'Opponent'}
                  </span>
                  <span className={`font-mono text-sm ${
                    match.result === 'win' ? 'text-green-400' :
                    match.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {tcwScore}-{oppScore}
                  </span>
                </Link>
              );
            })}
          </div>
          {playerMatches.length > 5 && (
            <Link
              to={`/history?player=${playerId}`}
              className="block text-center text-sm text-kendo-red hover:text-kendo-red/80 mt-3"
            >
              View all {playerMatches.length} matches →
            </Link>
          )}
        </div>
      )}

      {/* No matches */}
      {playerMatches.length === 0 && (
        <div className="card text-center py-6">
          <p className="text-kendo-cream/60 mb-2">No matches recorded yet</p>
          <Link to="/record" className="btn btn-primary text-sm">
            Record a Match
          </Link>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-kendo-cream">Edit Player</h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-kendo-cream/60 hover:text-kendo-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-kendo-cream/70 mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm text-kendo-cream/70 mb-2">Position</label>
                <select
                  value={editForm.position}
                  onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                  className="select"
                >
                  <option value="">No specific position</option>
                  {Object.entries(POSITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-kendo-cream/70 mb-2">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="input min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setIsEditing(false)} className="btn btn-outline flex-1">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary flex-1">
                <Save className="w-4 h-4 inline mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayerDetail;
