import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, Filter, Calendar, User, Users, Trophy,
  ChevronRight, Download
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MATCH_CONTEXT_LABELS, SCORERS, formatDate } from '../../utils/constants';
import { exportMatchesCSV } from '../../utils/storage';

function HistoryPage() {
  const { state } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlayer, setFilterPlayer] = useState('');
  const [filterContext, setFilterContext] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Combine and sort all matches
  const allMatches = useMemo(() => {
    const individual = state.matches.map(m => ({ ...m, matchType: 'individual' }));
    const team = state.teamMatches.map(m => ({ ...m, matchType: 'team' }));
    
    return [...individual, ...team]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [state.matches, state.teamMatches]);

  // Filter matches
  const filteredMatches = useMemo(() => {
    return allMatches.filter(match => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const playerName = match.tcwPlayer?.name?.toLowerCase() || '';
        const opponentName = match.opponent?.name?.toLowerCase() || match.opponentTeam?.toLowerCase() || '';
        if (!playerName.includes(query) && !opponentName.includes(query)) {
          return false;
        }
      }
      
      // Player filter
      if (filterPlayer && match.tcwPlayerId !== filterPlayer && match.matchType !== 'team') {
        return false;
      }
      
      // Context filter
      if (filterContext && match.context !== filterContext) {
        return false;
      }
      
      return true;
    });
  }, [allMatches, searchQuery, filterPlayer, filterContext]);

  const handleExport = () => {
    const matchesToExport = state.matches.filter(m => {
      if (filterPlayer && m.tcwPlayerId !== filterPlayer) return false;
      if (filterContext && m.context !== filterContext) return false;
      return true;
    });
    exportMatchesCSV(matchesToExport);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-kendo-cream">Match History</h1>
        <button
          onClick={handleExport}
          className="btn btn-outline text-sm flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kendo-cream/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players or opponents..."
          className="input pl-10"
        />
      </div>

      {/* Filter Toggle */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 text-sm text-kendo-cream/60 hover:text-kendo-cream mb-4"
      >
        <Filter className="w-4 h-4" />
        Filters
        {(filterPlayer || filterContext) && (
          <span className="bg-kendo-red text-white text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </button>

      {/* Filters */}
      {showFilters && (
        <div className="card mb-4 grid grid-cols-2 gap-3 animate-slide-up">
          <div>
            <label className="block text-xs text-kendo-cream/60 mb-1">Player</label>
            <select
              value={filterPlayer}
              onChange={(e) => setFilterPlayer(e.target.value)}
              className="select text-sm"
            >
              <option value="">All Players</option>
              {state.players.map(player => (
                <option key={player.id} value={player.id}>{player.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-kendo-cream/60 mb-1">Type</label>
            <select
              value={filterContext}
              onChange={(e) => setFilterContext(e.target.value)}
              className="select text-sm"
            >
              <option value="">All Types</option>
              {Object.entries(MATCH_CONTEXT_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          {(filterPlayer || filterContext) && (
            <button
              onClick={() => {
                setFilterPlayer('');
                setFilterContext('');
              }}
              className="col-span-2 text-sm text-kendo-red hover:text-kendo-red/80"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-kendo-cream">{filteredMatches.length}</p>
          <p className="text-xs text-kendo-cream/60">Matches</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-green-400">
            {filteredMatches.filter(m => m.result === 'win').length}
          </p>
          <p className="text-xs text-kendo-cream/60">Wins</p>
        </div>
        <div className="card text-center py-3">
          <p className="text-2xl font-bold text-red-400">
            {filteredMatches.filter(m => m.result === 'loss').length}
          </p>
          <p className="text-xs text-kendo-cream/60">Losses</p>
        </div>
      </div>

      {/* Match List */}
      {filteredMatches.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-kendo-cream/60 mb-2">No matches found</p>
          <Link to="/record" className="btn btn-primary text-sm">
            Record a Match
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMatches.map(match => {
            const isTeamMatch = match.matchType === 'team';
            const tcwScore = isTeamMatch 
              ? match.bouts?.filter(b => b.result === 'win').length || 0
              : match.scores?.filter(s => s.scorer === SCORERS.TCW).length || 0;
            const oppScore = isTeamMatch
              ? match.bouts?.filter(b => b.result === 'loss').length || 0
              : match.scores?.filter(s => s.scorer === SCORERS.OPPONENT).length || 0;

            return (
              <Link
                key={match.id}
                to={isTeamMatch ? `/history/${match.id}?type=team` : `/history/${match.id}`}
                className="card flex items-center gap-4 hover:bg-kendo-navy transition-colors group"
              >
                {/* Match Type Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isTeamMatch ? 'bg-kendo-gold/20' : 'bg-kendo-red/20'
                }`}>
                  {isTeamMatch ? (
                    <Users className="w-5 h-5 text-kendo-gold" />
                  ) : (
                    <User className="w-5 h-5 text-kendo-red" />
                  )}
                </div>

                {/* Match Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {/* Result indicator */}
                    <div className={`w-2 h-2 rounded-full ${
                      match.result === 'win' ? 'bg-green-500' :
                      match.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <p className="text-sm text-kendo-cream truncate">
                      {isTeamMatch ? (
                        `TCW vs ${match.opponentTeam || 'Opponent'}`
                      ) : (
                        `${match.tcwPlayer?.name || 'TCW'} vs ${match.opponent?.name || 'Opponent'}`
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-kendo-cream/50">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(match.date)}</span>
                    <span>•</span>
                    <span>{MATCH_CONTEXT_LABELS[match.context] || match.context}</span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <p className={`font-mono text-lg ${
                    match.result === 'win' ? 'text-green-400' :
                    match.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {tcwScore}-{oppScore}
                  </p>
                  <p className="text-xs text-kendo-cream/40 uppercase">
                    {match.result}
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-kendo-cream/30 group-hover:text-kendo-cream/60 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default HistoryPage;
