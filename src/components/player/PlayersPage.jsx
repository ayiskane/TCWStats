import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Search, User, ChevronRight, Trophy, Target,
  X, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { POSITION_LABELS, POSITIONS } from '../../utils/constants';
import { calculatePlayerStats } from '../../utils/stats';

function PlayersPage() {
  const { state, addPlayer, deletePlayer } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({ name: '', position: '', notes: '' });

  // Filter players
  const filteredPlayers = state.players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle add player
  const handleAddPlayer = () => {
    if (!newPlayer.name.trim()) {
      alert('Please enter a player name');
      return;
    }

    addPlayer({
      name: newPlayer.name.trim(),
      position: newPlayer.position || null,
      notes: newPlayer.notes,
    });

    setNewPlayer({ name: '', position: '', notes: '' });
    setShowAddModal(false);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-kendo-cream">Team Roster</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Player
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-kendo-cream/40" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players..."
          className="input pl-10"
        />
      </div>

      {/* Players List */}
      {filteredPlayers.length === 0 ? (
        <div className="card text-center py-8">
          {state.players.length === 0 ? (
            <>
              <User className="w-12 h-12 text-kendo-cream/30 mx-auto mb-4" />
              <p className="text-kendo-cream/60 mb-2">No players added yet</p>
              <p className="text-sm text-kendo-cream/40 mb-4">
                Add your team members to start tracking their statistics
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add First Player
              </button>
            </>
          ) : (
            <p className="text-kendo-cream/60">No players match your search</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPlayers.map(player => {
            const stats = calculatePlayerStats(state.matches, player.id);
            
            return (
              <Link
                key={player.id}
                to={`/players/${player.id}`}
                className="card flex items-center gap-4 hover:bg-kendo-navy transition-colors group"
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-kendo-red/20 flex items-center justify-center">
                  <span className="text-lg font-bold text-kendo-red">
                    {player.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                {/* Player Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-kendo-cream truncate">
                    {player.name}
                  </p>
                  <p className="text-sm text-kendo-cream/50">
                    {player.position ? POSITION_LABELS[player.position] : 'No position set'}
                  </p>
                </div>

                {/* Stats */}
                <div className="text-right">
                  <div className="flex items-center gap-2 justify-end">
                    <Trophy className="w-4 h-4 text-kendo-gold" />
                    <span className="text-sm text-kendo-cream">
                      {stats.wins}W - {stats.losses}L
                    </span>
                  </div>
                  <p className="text-xs text-kendo-cream/40">
                    {stats.totalMatches} matches
                  </p>
                </div>

                <ChevronRight className="w-5 h-5 text-kendo-cream/30 group-hover:text-kendo-cream/60 transition-colors" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Team Stats Summary */}
      {state.players.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-kendo-cream mb-4">Team Summary</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center">
              <p className="text-3xl font-bold text-kendo-cream">{state.players.length}</p>
              <p className="text-sm text-kendo-cream/60">Total Players</p>
            </div>
            <div className="card text-center">
              <p className="text-3xl font-bold text-kendo-cream">{state.matches.length}</p>
              <p className="text-sm text-kendo-cream/60">Total Matches</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="card max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-kendo-cream">Add Player</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-kendo-cream/60 hover:text-kendo-cream"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-kendo-cream/70 mb-2">
                  Player Name *
                </label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter player name..."
                  className="input"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-kendo-cream/70 mb-2">
                  Position (optional)
                </label>
                <select
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                  className="select"
                >
                  <option value="">No specific position</option>
                  {Object.entries(POSITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-kendo-cream/70 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newPlayer.notes}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Strengths, weaknesses, preferred waza..."
                  className="input min-h-[80px] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddPlayer}
                className="btn btn-primary flex-1"
              >
                <Check className="w-4 h-4 inline mr-2" />
                Add Player
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayersPage;
