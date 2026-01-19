import React from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  ChevronLeft, Calendar, Clock, Video, Trash2, 
  ExternalLink, Target
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  MATCH_CONTEXT_LABELS, TARGET_LABELS, WAZA_LABELS,
  SCORERS, formatDate, formatTime 
} from '../../utils/constants';

function MatchDetail() {
  const { matchId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { state, deleteMatch, deleteTeamMatch } = useApp();

  const isTeamMatch = searchParams.get('type') === 'team';
  
  const match = isTeamMatch
    ? state.teamMatches.find(m => m.id === matchId)
    : state.matches.find(m => m.id === matchId);

  if (!match) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <div className="card text-center py-8">
          <p className="text-kendo-cream/60 mb-4">Match not found</p>
          <button onClick={() => navigate('/history')} className="btn btn-primary">
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (!confirm('Delete this match? This cannot be undone.')) return;
    
    if (isTeamMatch) {
      deleteTeamMatch(matchId);
    } else {
      deleteMatch(matchId);
    }
    navigate('/history');
  };

  // Calculate scores
  const tcwScore = isTeamMatch
    ? match.bouts?.filter(b => b.result === 'win').length || 0
    : match.scores?.filter(s => s.scorer === SCORERS.TCW).length || 0;
  const oppScore = isTeamMatch
    ? match.bouts?.filter(b => b.result === 'loss').length || 0
    : match.scores?.filter(s => s.scorer === SCORERS.OPPONENT).length || 0;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/history')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-kendo-cream" />
        </button>
        <h1 className="text-xl font-semibold text-kendo-cream flex-1">Match Details</h1>
        <button
          onClick={handleDelete}
          className="p-2 text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Result Banner */}
      <div className={`card mb-6 text-center py-6 ${
        match.result === 'win' ? 'bg-green-600/20 border-green-600/30' :
        match.result === 'loss' ? 'bg-red-600/20 border-red-600/30' :
        'bg-yellow-600/20 border-yellow-600/30'
      }`}>
        <p className={`text-sm font-semibold uppercase mb-2 ${
          match.result === 'win' ? 'text-green-400' :
          match.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
        }`}>
          {match.result}
        </p>
        <p className="text-4xl font-bold text-kendo-cream mb-2">
          {tcwScore} - {oppScore}
        </p>
        <p className="text-kendo-cream/60">
          {isTeamMatch ? (
            `TCW vs ${match.opponentTeam || 'Opponent'}`
          ) : (
            `${match.tcwPlayer?.name || 'TCW'} vs ${match.opponent?.name || 'Opponent'}`
          )}
        </p>
      </div>

      {/* Match Info */}
      <div className="card mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-kendo-cream/40" />
            <span className="text-sm text-kendo-cream">{formatDate(match.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-kendo-cream/40" />
            <span className="text-sm text-kendo-cream">
              {MATCH_CONTEXT_LABELS[match.context] || match.context}
            </span>
          </div>
          {match.duration > 0 && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-kendo-cream/40" />
              <span className="text-sm text-kendo-cream">
                {formatTime(match.duration).formatted}
              </span>
            </div>
          )}
          {match.videoUrl && (
            <a
              href={match.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-kendo-red hover:text-kendo-red/80"
            >
              <Video className="w-4 h-4" />
              <span className="text-sm">Watch Video</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      {/* Team Match Bouts */}
      {isTeamMatch && match.bouts && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Bout Results</h3>
          <div className="space-y-3">
            {match.bouts.map((bout, idx) => {
              const boutTcwScore = bout.scores?.filter(s => s.scorer === SCORERS.TCW).length || 0;
              const boutOppScore = bout.scores?.filter(s => s.scorer === SCORERS.OPPONENT).length || 0;
              const tcwPlayer = state.players.find(p => p.id === bout.tcwPlayerId);
              
              return (
                <div
                  key={bout.id || idx}
                  className={`p-3 rounded-lg border ${
                    bout.result === 'win' ? 'bg-green-600/10 border-green-600/30' :
                    bout.result === 'loss' ? 'bg-red-600/10 border-red-600/30' :
                    'bg-yellow-600/10 border-yellow-600/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-kendo-cream/50 uppercase">
                      {bout.position}
                    </span>
                    <span className={`text-xs font-semibold uppercase ${
                      bout.result === 'win' ? 'text-green-400' :
                      bout.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {bout.result}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-kendo-cream">
                      {tcwPlayer?.name || 'TCW'}
                    </span>
                    <span className="font-mono text-kendo-cream">
                      {boutTcwScore} - {boutOppScore}
                    </span>
                    <span className="text-sm text-kendo-cream/60">
                      {bout.opponentName || 'Opponent'}
                    </span>
                  </div>
                  
                  {/* Bout scores */}
                  {bout.scores && bout.scores.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-kendo-gray/20 space-y-1">
                      {bout.scores.map((score, sIdx) => (
                        <div
                          key={score.id || sIdx}
                          className="flex items-center gap-2 text-xs"
                        >
                          <span className="font-mono text-kendo-cream/40">
                            {formatTime(score.timestamp).formatted}
                          </span>
                          <span className={`font-semibold ${
                            score.scorer === SCORERS.TCW ? 'text-kendo-red' : 'text-kendo-gold'
                          }`}>
                            {score.scorer === SCORERS.TCW ? 'TCW' : 'OPP'}
                          </span>
                          <span className="text-kendo-cream uppercase">
                            {score.target}
                          </span>
                          {score.waza && (
                            <span className="text-kendo-cream/40">
                              ({WAZA_LABELS[score.waza]?.split(' ')[0] || score.waza})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Individual Match Scores */}
      {!isTeamMatch && match.scores && match.scores.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Score Timeline</h3>
          <div className="space-y-2">
            {match.scores.map((score, idx) => (
              <div
                key={score.id || idx}
                className={`log-entry ${score.scorer}`}
              >
                <span className="font-mono text-sm text-kendo-cream/60">
                  {formatTime(score.timestamp).formatted}
                </span>
                <span className={`text-sm font-semibold ${
                  score.scorer === SCORERS.TCW ? 'text-kendo-red' : 'text-kendo-gold'
                }`}>
                  {score.scorer === SCORERS.TCW 
                    ? match.tcwPlayer?.name || 'TCW' 
                    : match.opponent?.name || 'Opponent'}
                </span>
                <span className="text-sm text-kendo-cream uppercase">
                  {TARGET_LABELS[score.target] || score.target}
                </span>
                {score.waza && (
                  <span className="text-xs text-kendo-cream/50">
                    {WAZA_LABELS[score.waza]?.split(' ')[0] || score.waza}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Video Timestamp Reference */}
      {match.videoUrl && match.scores && match.scores.length > 0 && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">
            Video Timestamps
          </h3>
          <p className="text-xs text-kendo-cream/40 mb-3">
            Reference these timestamps when reviewing the video
          </p>
          <div className="space-y-1">
            {(isTeamMatch ? match.bouts?.flatMap(b => b.scores || []) : match.scores)?.map((score, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <code className="bg-kendo-navy px-2 py-1 rounded text-kendo-gold font-mono text-xs">
                  {formatTime(score.timestamp).formatted}
                </code>
                <span className="text-kendo-cream">
                  {score.scorer === SCORERS.TCW ? 'TCW' : 'OPP'} - {score.target}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {match.notes && (
        <div className="card mb-6">
          <h3 className="text-sm font-semibold text-kendo-cream/60 mb-2">Notes</h3>
          <p className="text-sm text-kendo-cream">{match.notes}</p>
        </div>
      )}

      {/* Player Link */}
      {!isTeamMatch && match.tcwPlayerId && (
        <Link
          to={`/players/${match.tcwPlayerId}`}
          className="btn btn-outline w-full"
        >
          View {match.tcwPlayer?.name}'s Profile →
        </Link>
      )}
    </div>
  );
}

export default MatchDetail;
