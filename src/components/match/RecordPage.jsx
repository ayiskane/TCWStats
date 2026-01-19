import React from 'react';
import { Link } from 'react-router-dom';
import { User, Users, PlayCircle, Clock, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function RecordPage() {
  const { state } = useApp();
  
  // Quick stats
  const todayMatches = state.matches.filter(m => {
    const matchDate = new Date(m.date).toDateString();
    const today = new Date().toDateString();
    return matchDate === today;
  }).length;

  const totalMatches = state.matches.length;
  const totalWins = state.matches.filter(m => m.result === 'win').length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card text-center">
          <Clock className="w-6 h-6 text-kendo-gold mx-auto mb-1" />
          <p className="text-2xl font-bold text-kendo-cream">{todayMatches}</p>
          <p className="text-xs text-kendo-cream/60">Today</p>
        </div>
        <div className="card text-center">
          <PlayCircle className="w-6 h-6 text-kendo-red mx-auto mb-1" />
          <p className="text-2xl font-bold text-kendo-cream">{totalMatches}</p>
          <p className="text-xs text-kendo-cream/60">Total Matches</p>
        </div>
        <div className="card text-center">
          <Trophy className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-kendo-cream">{totalWins}</p>
          <p className="text-xs text-kendo-cream/60">Wins</p>
        </div>
      </div>

      {/* Match Type Selection */}
      <h2 className="text-lg font-semibold text-kendo-cream mb-4">
        Start New Match
      </h2>

      <div className="space-y-4">
        {/* Individual Match */}
        <Link
          to="/record/individual"
          className="card flex items-center gap-4 hover:bg-kendo-navy transition-colors group"
        >
          <div className="w-16 h-16 rounded-xl bg-kendo-red/20 flex items-center justify-center group-hover:bg-kendo-red/30 transition-colors">
            <User className="w-8 h-8 text-kendo-red" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-kendo-cream text-lg">Individual Match</h3>
            <p className="text-sm text-kendo-cream/60">
              Record a single 1v1 bout (practice or tournament)
            </p>
          </div>
          <div className="text-kendo-cream/40 group-hover:text-kendo-cream/60 transition-colors">
            →
          </div>
        </Link>

        {/* Team Match */}
        <Link
          to="/record/team"
          className="card flex items-center gap-4 hover:bg-kendo-navy transition-colors group"
        >
          <div className="w-16 h-16 rounded-xl bg-kendo-gold/20 flex items-center justify-center group-hover:bg-kendo-gold/30 transition-colors">
            <Users className="w-8 h-8 text-kendo-gold" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-kendo-cream text-lg">Team Match (5v5)</h3>
            <p className="text-sm text-kendo-cream/60">
              Record a full team match with all 5 positions
            </p>
          </div>
          <div className="text-kendo-cream/40 group-hover:text-kendo-cream/60 transition-colors">
            →
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      {state.matches.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-kendo-cream mb-4">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {state.matches.slice(-3).reverse().map(match => (
              <Link
                key={match.id}
                to={`/history/${match.id}`}
                className="card p-3 flex items-center gap-3 hover:bg-kendo-navy transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${
                  match.result === 'win' ? 'bg-green-500' :
                  match.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-kendo-cream truncate">
                    {match.tcwPlayer?.name || 'Unknown'} vs {match.opponent?.name || 'Opponent'}
                  </p>
                  <p className="text-xs text-kendo-cream/50">
                    {new Date(match.date).toLocaleDateString()}
                  </p>
                </div>
                <span className={`text-sm font-mono ${
                  match.result === 'win' ? 'text-green-400' :
                  match.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {match.scores?.filter(s => s.scorer === 'tcw').length || 0}-
                  {match.scores?.filter(s => s.scorer === 'opponent').length || 0}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* No players warning */}
      {state.players.length === 0 && (
        <div className="mt-8 card bg-kendo-gold/10 border border-kendo-gold/30">
          <p className="text-sm text-kendo-gold mb-2">
            ⚠️ No players added yet
          </p>
          <p className="text-xs text-kendo-cream/60 mb-3">
            Add team members to track individual statistics.
          </p>
          <Link to="/players" className="btn btn-outline text-sm">
            Add Players →
          </Link>
        </div>
      )}
    </div>
  );
}

export default RecordPage;
