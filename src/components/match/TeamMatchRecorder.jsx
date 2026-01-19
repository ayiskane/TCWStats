import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, Pause, RotateCcw, X, Check, ChevronLeft, ChevronRight,
  AlertCircle, Video, Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTimer } from '../../hooks/useTimer';
import {
  TARGETS, TARGET_LABELS, WAZA, WAZA_LABELS, WAZA_BY_CATEGORY,
  SCORERS, MATCH_CONTEXTS, MATCH_CONTEXT_LABELS,
  MATCH_FORMATS, MATCH_FORMAT_LABELS, POSITIONS, POSITION_LABELS, POSITION_ORDER,
  generateId, formatTime,
} from '../../utils/constants';
import { determineMatchResult } from '../../utils/stats';

function TeamMatchRecorder() {
  const navigate = useNavigate();
  const { state, addTeamMatch, addMatch } = useApp();
  const timer = useTimer();

  // Match setup state
  const [phase, setPhase] = useState('setup'); // setup, recording, summary
  const [teamConfig, setTeamConfig] = useState({
    opponentTeam: '',
    context: MATCH_CONTEXTS.TOURNAMENT,
    videoUrl: '',
    lineup: {
      [POSITIONS.SENPO]: '',
      [POSITIONS.JIHO]: '',
      [POSITIONS.CHUKEN]: '',
      [POSITIONS.FUKUSHO]: '',
      [POSITIONS.TAISHO]: '',
    },
    opponentLineup: {
      [POSITIONS.SENPO]: '',
      [POSITIONS.JIHO]: '',
      [POSITIONS.CHUKEN]: '',
      [POSITIONS.FUKUSHO]: '',
      [POSITIONS.TAISHO]: '',
    },
  });

  // Current bout state
  const [currentPosition, setCurrentPosition] = useState(POSITIONS.SENPO);
  const [bouts, setBouts] = useState([]);
  const [currentBoutScores, setCurrentBoutScores] = useState([]);
  
  // Modal states
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [pendingScore, setPendingScore] = useState(null);
  const [showWazaSelect, setShowWazaSelect] = useState(false);

  // Get current position index
  const positionIndex = POSITION_ORDER.indexOf(currentPosition);
  const isLastPosition = positionIndex === POSITION_ORDER.length - 1;

  // Calculate current bout score
  const tcwScore = currentBoutScores.filter(s => s.scorer === SCORERS.TCW).length;
  const oppScore = currentBoutScores.filter(s => s.scorer === SCORERS.OPPONENT).length;
  const isBoutOver = tcwScore >= 2 || oppScore >= 2;

  // Calculate team score (wins)
  const teamTcwWins = bouts.filter(b => b.result === 'win').length;
  const teamOppWins = bouts.filter(b => b.result === 'loss').length;

  // Handle target button press
  const handleTargetPress = useCallback((target) => {
    if (isBoutOver) return;
    
    const timestamp = timer.getTimestamp();
    setPendingScore({
      id: generateId(),
      timestamp,
      target,
      scorer: null,
      waza: null,
    });
    setShowScoreModal(true);
  }, [timer, isBoutOver]);

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
    setCurrentBoutScores(prev => [...prev, score]);
    setPendingScore(null);
    setShowScoreModal(false);
    setShowWazaSelect(false);
    
    // Check if bout is over
    const newTcwScore = currentBoutScores.filter(s => s.scorer === SCORERS.TCW).length + 
                        (score.scorer === SCORERS.TCW ? 1 : 0);
    const newOppScore = currentBoutScores.filter(s => s.scorer === SCORERS.OPPONENT).length +
                        (score.scorer === SCORERS.OPPONENT ? 1 : 0);
    
    if (newTcwScore >= 2 || newOppScore >= 2) {
      timer.pause();
    }
  };

  // End current bout and move to next
  const endBout = () => {
    timer.pause();
    
    const result = tcwScore > oppScore ? 'win' : tcwScore < oppScore ? 'loss' : 'draw';
    const tcwPlayerId = teamConfig.lineup[currentPosition];
    const tcwPlayer = state.players.find(p => p.id === tcwPlayerId);
    
    const bout = {
      id: generateId(),
      position: currentPosition,
      tcwPlayerId,
      tcwPlayer: tcwPlayer ? { id: tcwPlayer.id, name: tcwPlayer.name } : null,
      opponentName: teamConfig.opponentLineup[currentPosition],
      scores: currentBoutScores,
      duration: timer.time,
      result,
    };
    
    setBouts(prev => [...prev, bout]);
    
    // Also save as individual match for player stats
    if (tcwPlayerId) {
      const match = {
        date: new Date().toISOString(),
        type: 'individual',
        context: teamConfig.context,
        format: MATCH_FORMATS.SANBON,
        tcwPlayerId,
        tcwPlayer: tcwPlayer ? { id: tcwPlayer.id, name: tcwPlayer.name } : null,
        opponent: {
          name: teamConfig.opponentLineup[currentPosition] || 'Opponent',
          team: teamConfig.opponentTeam,
        },
        scores: currentBoutScores,
        duration: timer.time,
        result,
        videoUrl: teamConfig.videoUrl,
        notes: `Team match position: ${POSITION_LABELS[currentPosition]}`,
        isPartOfTeamMatch: true,
      };
      addMatch(match);
    }
    
    // Move to next position or end match
    if (isLastPosition) {
      endTeamMatch([...bouts, bout]);
    } else {
      setCurrentPosition(POSITION_ORDER[positionIndex + 1]);
      setCurrentBoutScores([]);
      timer.reset();
    }
  };

  // Skip current bout (draw/no contest)
  const skipBout = () => {
    const bout = {
      id: generateId(),
      position: currentPosition,
      tcwPlayerId: teamConfig.lineup[currentPosition],
      opponentName: teamConfig.opponentLineup[currentPosition],
      scores: [],
      duration: 0,
      result: 'draw',
      skipped: true,
    };
    
    setBouts(prev => [...prev, bout]);
    
    if (isLastPosition) {
      endTeamMatch([...bouts, bout]);
    } else {
      setCurrentPosition(POSITION_ORDER[positionIndex + 1]);
      setCurrentBoutScores([]);
      timer.reset();
    }
  };

  // End team match
  const endTeamMatch = (allBouts) => {
    const wins = allBouts.filter(b => b.result === 'win').length;
    const losses = allBouts.filter(b => b.result === 'loss').length;
    
    let result = 'draw';
    if (wins > losses) result = 'win';
    else if (losses > wins) result = 'loss';
    
    const teamMatch = {
      date: new Date().toISOString(),
      context: teamConfig.context,
      opponentTeam: teamConfig.opponentTeam,
      lineup: teamConfig.lineup,
      opponentLineup: teamConfig.opponentLineup,
      bouts: allBouts,
      result,
      videoUrl: teamConfig.videoUrl,
    };
    
    addTeamMatch(teamMatch);
    setPhase('summary');
  };

  // Start recording
  const startRecording = () => {
    // Validate at least one player in lineup
    const hasPlayers = Object.values(teamConfig.lineup).some(id => id);
    if (!hasPlayers && state.players.length > 0) {
      alert('Please assign at least one player to the lineup');
      return;
    }
    setPhase('recording');
  };

  // Cancel and go back
  const handleCancel = () => {
    if (phase === 'recording' && (bouts.length > 0 || currentBoutScores.length > 0)) {
      if (!confirm('Discard this team match?')) return;
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
              Team Match Setup
            </h1>
          </div>

          <div className="space-y-6">
            {/* Opponent Team */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                Opponent Team
              </label>
              <input
                type="text"
                value={teamConfig.opponentTeam}
                onChange={(e) => setTeamConfig(prev => ({ ...prev, opponentTeam: e.target.value }))}
                placeholder="e.g., Japan, USA, France..."
                className="input"
              />
            </div>

            {/* Match Context */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                Match Type
              </label>
              <select
                value={teamConfig.context}
                onChange={(e) => setTeamConfig(prev => ({ ...prev, context: e.target.value }))}
                className="select"
              >
                {Object.entries(MATCH_CONTEXT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* TCW Lineup */}
            <div>
              <h3 className="text-sm font-semibold text-kendo-cream mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-kendo-red" />
                TCW Lineup
              </h3>
              <div className="space-y-2">
                {POSITION_ORDER.map(position => (
                  <div key={position} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-kendo-cream/60">
                      {POSITION_LABELS[position]}
                    </span>
                    <select
                      value={teamConfig.lineup[position]}
                      onChange={(e) => setTeamConfig(prev => ({
                        ...prev,
                        lineup: { ...prev.lineup, [position]: e.target.value }
                      }))}
                      className="select flex-1"
                    >
                      <option value="">Select player...</option>
                      {state.players.map(player => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Lineup (optional) */}
            <div>
              <h3 className="text-sm font-semibold text-kendo-cream mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-kendo-gold" />
                Opponent Lineup (optional)
              </h3>
              <div className="space-y-2">
                {POSITION_ORDER.map(position => (
                  <div key={position} className="flex items-center gap-3">
                    <span className="w-24 text-sm text-kendo-cream/60">
                      {POSITION_LABELS[position]}
                    </span>
                    <input
                      type="text"
                      value={teamConfig.opponentLineup[position]}
                      onChange={(e) => setTeamConfig(prev => ({
                        ...prev,
                        opponentLineup: { ...prev.opponentLineup, [position]: e.target.value }
                      }))}
                      placeholder="Opponent name..."
                      className="input flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-sm text-kendo-cream/70 mb-2">
                <Video className="w-4 h-4 inline mr-1" />
                Video URL (optional)
              </label>
              <input
                type="url"
                value={teamConfig.videoUrl}
                onChange={(e) => setTeamConfig(prev => ({ ...prev, videoUrl: e.target.value }))}
                placeholder="https://youtube.com/watch?v=..."
                className="input"
              />
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startRecording}
            className="btn btn-primary w-full mt-8 py-4 text-lg"
          >
            <Play className="w-5 h-5 inline mr-2" />
            Start Team Match
          </button>
        </div>
      </div>
    );
  }

  // Render recording phase
  if (phase === 'recording') {
    const tcwPlayerId = teamConfig.lineup[currentPosition];
    const tcwPlayer = state.players.find(p => p.id === tcwPlayerId);
    const opponentName = teamConfig.opponentLineup[currentPosition] || 'Opponent';
    const { formatted } = timer.formatTime();

    return (
      <div className="min-h-screen bg-kendo-navy flex flex-col">
        {/* Position Progress */}
        <div className="bg-kendo-navy-light p-3 border-b border-kendo-gray/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-kendo-cream/60">
              Team Score: TCW {teamTcwWins} - {teamOppWins} {teamConfig.opponentTeam || 'OPP'}
            </span>
            <span className="text-sm text-kendo-gold font-semibold">
              {POSITION_LABELS[currentPosition]}
            </span>
          </div>
          <div className="flex gap-1">
            {POSITION_ORDER.map((pos, idx) => (
              <div
                key={pos}
                className={`h-1 flex-1 rounded ${
                  idx < positionIndex ? (
                    bouts[idx]?.result === 'win' ? 'bg-green-500' :
                    bouts[idx]?.result === 'loss' ? 'bg-red-500' : 'bg-yellow-500'
                  ) :
                  idx === positionIndex ? 'bg-kendo-gold' : 'bg-kendo-gray/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="bg-kendo-navy-light/50 p-4 text-center">
          <div className="timer-display text-kendo-cream text-5xl">
            {formatted}
          </div>
          
          <div className="flex justify-center gap-4 mt-3">
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

        {/* Bout Score */}
        <div className="flex items-center justify-around p-4 bg-kendo-navy-light/30">
          <div className="text-center">
            <p className="text-sm text-kendo-cream/60 mb-1">
              {tcwPlayer?.name || 'TCW'}
            </p>
            <p className="text-4xl font-bold text-kendo-red">{tcwScore}</p>
          </div>
          <div className="text-xl text-kendo-cream/40">vs</div>
          <div className="text-center">
            <p className="text-sm text-kendo-cream/60 mb-1">
              {opponentName}
            </p>
            <p className="text-4xl font-bold text-kendo-gold">{oppScore}</p>
          </div>
        </div>

        {/* Bout Over Banner */}
        {isBoutOver && (
          <div className={`p-3 text-center ${tcwScore > oppScore ? 'bg-green-600' : 'bg-red-600'}`}>
            <p className="font-bold text-white">
              {tcwScore > oppScore ? 'TCW Wins Bout!' : 'Opponent Wins Bout'}
            </p>
          </div>
        )}

        {/* Score Buttons */}
        <div className="flex-1 p-4 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto w-full">
            <button
              onClick={() => handleTargetPress(TARGETS.MEN)}
              disabled={isBoutOver}
              className="score-btn score-btn-men h-20"
            >
              Men
            </button>
            <button
              onClick={() => handleTargetPress(TARGETS.KOTE)}
              disabled={isBoutOver}
              className="score-btn score-btn-kote h-20"
            >
              Kote
            </button>
            <button
              onClick={() => handleTargetPress(TARGETS.DO)}
              disabled={isBoutOver}
              className="score-btn score-btn-do h-20"
            >
              Do
            </button>
            <button
              onClick={() => handleTargetPress(TARGETS.TSUKI)}
              disabled={isBoutOver}
              className="score-btn score-btn-tsuki h-20"
            >
              Tsuki
            </button>
          </div>
        </div>

        {/* Match Log */}
        <div className="bg-kendo-navy-light/50 p-3 max-h-32 overflow-auto">
          {currentBoutScores.length === 0 ? (
            <p className="text-sm text-kendo-cream/40 text-center">
              No scores recorded
            </p>
          ) : (
            <div className="space-y-1">
              {currentBoutScores.map((score) => (
                <div
                  key={score.id}
                  className={`log-entry ${score.scorer} py-2`}
                >
                  <span className="font-mono text-xs text-kendo-cream/60">
                    {formatTime(score.timestamp).formatted}
                  </span>
                  <span className="text-sm font-semibold text-kendo-cream uppercase">
                    {score.target}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-kendo-navy-light border-t border-kendo-gray/20 flex gap-3">
          <button onClick={skipBout} className="btn btn-outline flex-1">
            Skip/Draw
          </button>
          <button onClick={endBout} className="btn btn-primary flex-1">
            <ChevronRight className="w-5 h-5 inline mr-1" />
            {isBoutOver ? 'Next Bout' : 'End Bout'}
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
                  className="btn bg-kendo-red text-white py-4"
                >
                  {tcwPlayer?.name || 'TCW'}
                </button>
                <button
                  onClick={() => handleScorerSelect(SCORERS.OPPONENT)}
                  className="btn bg-kendo-gold text-kendo-navy py-4"
                >
                  {opponentName}
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
            <div className="card max-w-sm w-full max-h-[70vh] overflow-auto animate-slide-up">
              <h3 className="text-lg font-semibold text-kendo-cream mb-4 text-center">
                Technique? (optional)
              </h3>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[...WAZA_BY_CATEGORY.shikake, ...WAZA_BY_CATEGORY.oji].map(waza => (
                  <button
                    key={waza}
                    onClick={() => handleWazaSelect(waza)}
                    className="btn btn-outline text-sm py-2"
                  >
                    {WAZA_LABELS[waza].split(' ')[0]}
                  </button>
                ))}
              </div>

              <button onClick={skipWazaSelect} className="btn btn-secondary w-full">
                Skip
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render summary
  if (phase === 'summary') {
    const wins = bouts.filter(b => b.result === 'win').length;
    const losses = bouts.filter(b => b.result === 'loss').length;
    const result = wins > losses ? 'WIN' : losses > wins ? 'LOSS' : 'DRAW';

    return (
      <div className="min-h-screen bg-kendo-navy p-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-2 rounded-full text-lg font-bold mb-4 ${
              result === 'WIN' ? 'bg-green-600 text-white' :
              result === 'LOSS' ? 'bg-red-600 text-white' : 'bg-yellow-600 text-white'
            }`}>
              TEAM {result}
            </div>
            <h1 className="text-3xl font-bold text-kendo-cream">
              TCW {wins} - {losses} {teamConfig.opponentTeam || 'Opponent'}
            </h1>
          </div>

          {/* Bout Results */}
          <div className="card mb-6">
            <h3 className="text-sm font-semibold text-kendo-cream/60 mb-3">Bout Results</h3>
            <div className="space-y-2">
              {bouts.map((bout) => {
                const tcwPlayer = state.players.find(p => p.id === bout.tcwPlayerId);
                const boutTcwScore = bout.scores?.filter(s => s.scorer === SCORERS.TCW).length || 0;
                const boutOppScore = bout.scores?.filter(s => s.scorer === SCORERS.OPPONENT).length || 0;
                
                return (
                  <div
                    key={bout.id}
                    className={`flex items-center gap-3 p-2 rounded-lg ${
                      bout.result === 'win' ? 'bg-green-600/20' :
                      bout.result === 'loss' ? 'bg-red-600/20' : 'bg-yellow-600/20'
                    }`}
                  >
                    <span className="text-xs text-kendo-cream/60 w-16">
                      {POSITION_LABELS[bout.position].split(' ')[0]}
                    </span>
                    <span className="flex-1 text-sm text-kendo-cream">
                      {tcwPlayer?.name || 'TCW'}
                    </span>
                    <span className="font-mono text-sm text-kendo-cream">
                      {boutTcwScore}-{boutOppScore}
                    </span>
                    <span className={`text-xs font-semibold uppercase ${
                      bout.result === 'win' ? 'text-green-400' :
                      bout.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                    }`}>
                      {bout.result}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

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

export default TeamMatchRecorder;
