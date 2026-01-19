import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, X, Check, ChevronLeft,
  AlertCircle, Video, Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTimer } from '../../hooks/useTimer';
import {
  TARGETS, TARGET_LABELS, WAZA, WAZA_LABELS, WAZA_BY_CATEGORY,
  SCORERS, MATCH_CONTEXTS, MATCH_CONTEXT_LABELS,
  MATCH_FORMATS, MATCH_FORMAT_LABELS,
  generateId, formatTime,
} from '../../utils/constants';
import { determineMatchResult } from '../../utils/stats';

function MatchRecorder() {
  const navigate = useNavigate();
  const { state, addMatch } = useApp();
  const timer = useTimer();

  // Match setup state
  const [phase, setPhase] = useState('setup'); // setup, recording, summary
  const [matchConfig, setMatchConfig] = useState({
    tcwPlayerId: '',
    opponentName: '',
    opponentTeam: '',
    context: MATCH_CONTEXTS.PRACTICE,
    format: MATCH_FORMATS.SANBON,
    videoUrl: '',
  });

  // Recording state
  const [scores, setScores] = useState([]);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(null);
  const [showWazaSelect, setShowWazaSelect] = useState(false);

  // Calculate current score
  const tcwScore = scores.filter(s => s.scorer === SCORERS.TCW).length;
  const oppScore = scores.filter(s => s.scorer === SCORERS.OPPONENT).length;
  const winningScore = matchConfig.format === MATCH_FORMATS.SANBON ? 2 : 1;
  const isMatchOver = tcwScore >= winningScore || oppScore >= winningScore;

  // Handle target button press
  const handleTargetPress = useCallback((target) => {
    if (isMatchOver) return;
    
    const timestamp = timer.getTimestamp();
    setPendingScore({
      id: generateId(),
      timestamp,
      target,
      scorer: null,
      waza: null,
    });
    setShowScoreModal(true);
  }, [timer, isMatchOver]);

  // Handle scorer selection
  const handleScorerSelect = (scorer) => {
    if (!pendingScore) return;
    
    const updatedScore = { ...pendingScore, scorer };
    
    if (state.settings.showWazaPrompt) {
      setPendingScore(updatedScore);
      setShowScoreModal(false);
      setShowWazaSelect(true);
    } else {
      finalizeScore(updatedScore);
    }
  };

  // Handle waza selection
  const handleWazaSelect = (waza) => {
    if (!pendingScore) return;
    finalizeScore({ ...pendingScore, waza });
  };

  // Skip waza selection
  const skipWazaSelect = () => {
    if (!pendingScore) return;
    finalizeScore(pendingScore);
  };

  // Finalize and add score
  const finalizeScore = (score) => {
    setScores(prev => [...prev, score]);
    setPendingScore(null);
    setShowScoreModal(false);
    setShowWazaSelect(false);
    
    // Check if match is over
    const newTcwScore = scores.filter(s => s.scorer === SCORERS.TCW).length + 
                        (score.scorer === SCORERS.TCW ? 1 : 0);
    const newOppScore = scores.filter(s => s.scorer === SCORERS.OPPONENT).length +
                        (score.scorer === SCORERS.OPPONENT ? 1 : 0);
    
    if (newTcwScore >= winningScore || newOppScore >= winningScore) {
      timer.pause();
    }
  };

  // Undo last score
  const undoLastScore = () => {
    setScores(prev => prev.slice(0, -1));
  };

  // Start recording
  const startRecording = () => {
    if (!matchConfig.tcwPlayerId && state.players.length > 0) {
      alert('Please select a TCW player');
      return;
    }
    setPhase('recording');
  };

  // End match and save
  const endMatch = () => {
    timer.pause();
    
    const result = determineMatchResult(scores, matchConfig.format);
    const tcwPlayer = state.players.find(p => p.id === matchConfig.tcwPlayerId);
    
    const match = {
      date: new Date().toISOString(),
      type: 'individual',
      context: matchConfig.context,
      format: matchConfig.format,
      tcwPlayerId: matchConfig.tcwPlayerId,
      tcwPlayer: tcwPlayer ? { id: tcwPlayer.id, name: tcwPlayer.name } : null,
      opponent: {
        name: matchConfig.opponentName || 'Opponent',
        team: matchConfig.opponentTeam,
      },
      scores,
      duration: timer.time,
      result,
      videoUrl: matchConfig.videoUrl,
      notes: '',
    };
    
    const savedMatch = addMatch(match);
    setPhase('summary');
  };

  // Cancel and go back
  const handleCancel = () => {
    if (phase === 'recording' && scores.length > 0) {
      if (!confirm('Discard this match?')) return;
    }
    navigate('/record');
  };

  // Render setup phase
  if (phase === 'setup') {
    return (
      <div className="min-h-screen bg-kendo-navy p-4">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={handleCancel} className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6 text-kendo-cream" />
            </button>
            <h1 className="text-xl font-semibold text-kendo-cream">
              Individual Match Setup
            </h1>
          </div>

          <div className="space-y-4">
            {/* TCW Player */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                TCW Player
              </label>
              {state.players.length > 0 ? (
                <select
                  value={matchConfig.tcwPlayerId}
                  onChange={(e) => setMatchConfig(prev => ({ ...prev, tcwPlayerId: e.target.value }))}
                  className="select"
                >
                  <option value="">Select player...</option>
                  {state.players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.name} {player.position ? `(${player.position})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="input bg-kendo-gray/20 text-kendo-cream/50">
                  No players added yet
                </div>
              )}
            </div>

            {/* Opponent */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                Opponent Name
              </label>
              <input
                type="text"
                value={matchConfig.opponentName}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, opponentName: e.target.value }))}
                placeholder="Enter opponent name..."
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                Opponent Team (optional)
              </label>
              <input
                type="text"
                value={matchConfig.opponentTeam}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, opponentTeam: e.target.value }))}
                placeholder="Enter team name..."
                className="input"
              />
            </div>

            {/* Match Context */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                Match Type
              </label>
              <select
                value={matchConfig.context}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, context: e.target.value }))}
                className="select"
              >
                {Object.entries(MATCH_CONTEXT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Match Format */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                Match Format
              </label>
              <select
                value={matchConfig.format}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, format: e.target.value }))}
                className="select"
              >
                {Object.entries(MATCH_FORMAT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Video URL (optional) */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Video URL (optional)
              </label>
              <input
                type="url"
                value={matchConfig.videoUrl}
                onChange={(e) => setMatchConfig(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="input"
              />
              <p className="text-xs text-kendo-cream/40 mt-1">
                Link a video to sync timestamps with recordings
              </p>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startRecording}
            className="btn btn-primary w-full mt-8 py-4 text-lg"
          >
            <Play className="w-5 h-5 inline mr-2" />
            Start Match
          </button>
        </div>
      </div>
    );
  }

  // Render recording phase
  if (phase === 'recording') {
    const tcwPlayer = state.players.find(p => p.id === matchConfig.tcwPlayerId);
    const { formatted } = timer.formatTime();

    return (
      <div className="min-h-screen bg-kendo-navy flex flex-col">
        {/* Timer Header */}
        <div className="bg-kendo-navy-light p-4 text-center">
          <div className="timer-display text-kendo-cream">
            {formatted}
          </div>
          
          {/* Timer Controls */}
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={timer.toggle}
              className={`btn ${timer.isRunning ? 'btn-secondary' : 'btn-primary'} px-6`}
            >
              {timer.isRunning ? (
                <><Pause className="w-5 h-5 inline mr-2" /> Pause</>
              ) : (
                <><Play className="w-5 h-5 inline mr-2" /> {timer.time > 0 ? 'Resume' : 'Start'}</>
              )}
            </button>
            <button
              onClick={() => {
                if (confirm('Reset timer?')) timer.reset();
              }}
              className="btn btn-outline"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center justify-around p-4 bg-kendo-navy-light/50">
          <div className="text-center">
            <p className="text-sm text-kendo-cream/60 mb-1">
              {tcwPlayer?.name || 'TCW'}
            </p>
            <p className="text-5xl font-bold text-kendo-red">{tcwScore}</p>
          </div>
          <div className="text-2xl text-kendo-cream/40">vs</div>
          <div className="text-center">
            <p className="text-sm text-kendo-cream/60 mb-1">
              {matchConfig.opponentName || 'Opponent'}
            </p>
            <p className="text-5xl font-bold text-kendo-gold">{oppScore}</p>
          </div>
        </div>

        {/* Match Over Banner */}
        {isMatchOver && (
          <div className={`p-3 text-center ${tcwScore > oppScore ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="font-bold text-white">
              {tcwScore > oppScore ? '🎉 TCW WINS!' : 'Match Over'}
            </p>
          </div>
        )}

        {/* Score Buttons */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <p className="text-center text-kendo-cream/60 mb-4">
            Tap target to record ippon
          </p>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto w-full">
            <button
              onClick={() => handleTargetPress(TARGETS.MEN)}
              disabled={isMatchOver}
              className="score-btn score-btn-men h-24"
            >
              Men
            </button>
            <button
              onClick={() => handleTargetPress(TARGETS.KOTE)}
              disabled={isMatchOver}
              className="score-btn score-btn-kote h-24"
            >
              Kote
            </button>
            <button
              onClick={() => handleTargetPress(TARGETS.DO)}
              disabled={isMatchOver}
              className="score-btn score-btn-do h-24"
            >
              Do
            </button>
            <button
              onClick={() => handleTargetPress(TARGETS.TSUKI)}
              disabled={isMatchOver}
              className="score-btn score-btn-tsuki h-24"
            >
              Tsuki
            </button>
          </div>
        </div>

        {/* Match Log */}
        <div className="bg-kendo-navy-light/50 p-4 max-h-48 overflow-auto">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-kendo-cream/60">Match Log</h3>
            {scores.length > 0 && (
              <button
                onClick={undoLastScore}
                className="text-xs text-kendo-cream/40 hover:text-kendo-cream"
              >
                Undo Last
              </button>
            )}
          </div>
          {scores.length === 0 ? (
            <p className="text-sm text-kendo-cream/40 text-center py-2">
              No scores recorded yet
            </p>
          ) : (
            <div className="space-y-2">
              {scores.map((score, idx) => (
                <div
                  key={score.id}
                  className={`log-entry ${score.scorer}`}
                >
                  <span className="font-mono text-sm text-kendo-cream/60">
                    {formatTime(score.timestamp).formatted}
                  </span>
                  <span className="text-sm text-kendo-cream">
                    {score.scorer === SCORERS.TCW ? tcwPlayer?.name || 'TCW' : matchConfig.opponentName || 'Opponent'}
                  </span>
                  <span className="text-sm font-semibold text-kendo-cream uppercase">
                    {score.target}
                  </span>
                  {score.waza && (
                    <span className="text-xs text-kendo-cream/50">
                      ({score.waza})
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-kendo-navy-light border-t border-kendo-gray/20 flex gap-3">
          <button onClick={handleCancel} className="btn btn-outline flex-1">
            Cancel
          </button>
          <button onClick={endMatch} className="btn btn-primary flex-1">
            <Check className="w-5 h-5 inline mr-2" />
            End Match
          </button>
        </div>

        {/* Scorer Modal */}
        {showScoreModal && pendingScore && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card max-w-sm w-full animate-slide-up">
              <h3 className="text-lg font-semibold text-kendo-cream mb-4 text-center">
                Who scored {TARGET_LABELS[pendingScore.target]}?
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleScorerSelect(SCORERS.TCW)}
                  className="btn bg-kendo-red text-white py-4 text-lg"
                >
                  {tcwPlayer?.name || 'TCW'}
                </button>
                <button
                  onClick={() => handleScorerSelect(SCORERS.OPPONENT)}
                  className="btn bg-kendo-gold text-kendo-navy py-4 text-lg"
                >
                  Opponent
                </button>
              </div>
              <button
                onClick={() => {
                  setShowScoreModal(false);
                  setPendingScore(null);
                }}
                className="btn btn-outline w-full mt-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Waza Select Modal */}
        {showWazaSelect && pendingScore && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card max-w-sm w-full max-h-[80vh] overflow-auto animate-slide-up">
              <h3 className="text-lg font-semibold text-kendo-cream mb-4 text-center">
                Which technique? (optional)
              </h3>
              
              <div className="mb-4">
                <p className="text-xs text-kendo-cream/50 mb-2">Shikake-waza (Attacking)</p>
                <div className="grid grid-cols-2 gap-2">
                  {WAZA_BY_CATEGORY.shikake.map(waza => (
                    <button
                      key={waza}
                      onClick={() => handleWazaSelect(waza)}
                      className="btn btn-outline text-sm py-2"
                    >
                      {WAZA_LABELS[waza].split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-kendo-cream/50 mb-2">Oji-waza (Counter)</p>
                <div className="grid grid-cols-2 gap-2">
                  {WAZA_BY_CATEGORY.oji.map(waza => (
                    <button
                      key={waza}
                      onClick={() => handleWazaSelect(waza)}
                      className="btn btn-outline text-sm py-2"
                    >
                      {WAZA_LABELS[waza].split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={skipWazaSelect}
                className="btn btn-secondary w-full"
              >
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render summary phase
  if (phase === 'summary') {
    const tcwPlayer = state.players.find(p => p.id === matchConfig.tcwPlayerId);
    const result = tcwScore > oppScore ? 'WIN' : tcwScore < oppScore ? 'LOSS' : 'DRAW';

    return (
      <div className="min-h-screen bg-kendo-navy p-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold mb-4 ${
              result === 'WIN' ? 'bg-green-600 text-white' :
              result === 'LOSS' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              {result}
            </div>
            <h1 className="text-3xl font-bold text-kendo-cream">
              {tcwScore} - {oppScore}
            </h1>
            <p className="text-kendo-cream/60 mt-2">
              {tcwPlayer?.name || 'TCW'} vs {matchConfig.opponentName || 'Opponent'}
            </p>
            <p className="text-sm text-kendo-cream/40 mt-1">
              Duration: {timer.formatTime().formatted}
            </p>
          </div>

          {/* Score Breakdown */}
          {scores.length > 0 && (
            <div className="card mb-6">
              <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Score Timeline</h3>
              <div className="space-y-2">
                {scores.map((score, idx) => (
                  <div
                    key={score.id}
                    className={`log-entry ${score.scorer}`}
                  >
                    <span className="font-mono text-sm text-kendo-cream/60">
                      {formatTime(score.timestamp).formatted}
                    </span>
                    <span className="text-sm text-kendo-cream">
                      {score.scorer === SCORERS.TCW ? tcwPlayer?.name || 'TCW' : matchConfig.opponentName || 'Opponent'}
                    </span>
                    <span className="text-sm font-semibold text-kendo-cream uppercase">
                      {score.target}
                    </span>
                    {score.waza && (
                      <span className="text-xs text-kendo-cream/50">
                        ({score.waza})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/record')}
              className="btn btn-outline flex-1"
            >
              New Match
            </button>
            <button
              onClick={() => navigate('/history')}
              className="btn btn-primary flex-1"
            >
              View History
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default MatchRecorder;
