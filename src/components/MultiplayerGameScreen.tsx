import { useState, useEffect } from 'react';
import { usePlayersList, useMultiplayerState, myPlayer, useIsHost } from 'playroomkit';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ScenarioDisplay from './ScenarioDisplay';
import Timer from './Timer';

interface MultiplayerGameScreenProps {
  scenario: string;
  roundNumber: number;
  onAdvanceToVerdicts: () => void;
}

const MultiplayerGameScreen = ({ scenario, roundNumber, onAdvanceToVerdicts }: MultiplayerGameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const players = usePlayersList(true);
  const isHost = useIsHost();
  const [gameState, setGameState] = useMultiplayerState('game', {
    phase: 'collectingSubmissions',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    submissions: {},
    verdicts: {},
    scores: {},
    playerNames: {},
    leaderboard: [],
    roundEndTime: 0,
    playersDone: {},
    submissionTimes: {}
  });

  // Check if all players are done (submitted or timed out)
  useEffect(() => {
    const allPlayerIds = players.map(p => p.id);
    const donePlayerIds = Object.keys(gameState.playersDone || {});
    const allDone = allPlayerIds.length > 0 && 
                    allPlayerIds.every(id => gameState.playersDone?.[id]);
    
    if (allDone && gameState.phase === 'collectingSubmissions') {
      // Auto-advance to verdicts phase
      setTimeout(() => {
        onAdvanceToVerdicts();
      }, 1000);
    }
  }, [gameState.playersDone, players, gameState.phase, onAdvanceToVerdicts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !hasSubmitted) {
      const myPlayerId = myPlayer()?.id;
      if (myPlayerId) {
        const submissionTime = Date.now();
        // Update submissions, mark player as done, and record submission time
        setGameState({
          ...gameState,
          submissions: {
            ...gameState.submissions,
            [myPlayerId]: strategy.trim()
          },
          playersDone: {
            ...gameState.playersDone,
            [myPlayerId]: true
          },
          submissionTimes: {
            ...gameState.submissionTimes,
            [myPlayerId]: submissionTime
          }
        });
        setHasSubmitted(true);
      }
    }
  };

  const handleTimeUp = () => {
    const myPlayerId = myPlayer()?.id;
    if (myPlayerId && !hasSubmitted) {
      const submissionTime = Date.now();
      // Auto-submit empty strategy and mark as done
      setGameState({
        ...gameState,
        submissions: {
          ...gameState.submissions,
          [myPlayerId]: ''
        },
        playersDone: {
          ...gameState.playersDone,
          [myPlayerId]: true
        },
        submissionTimes: {
          ...gameState.submissionTimes,
          [myPlayerId]: submissionTime
        }
      });
      setHasSubmitted(true);
    }
  };

  // Get submission progress
  const allPlayerIds = players.map(p => p.id);
  const donePlayerIds = Object.keys(gameState.playersDone || {}).filter(id => gameState.playersDone?.[id]);
  const submissionProgress = (donePlayerIds.length / Math.max(allPlayerIds.length, 1)) * 100;

  return (
    <div className="space-y-6">
      {/* Top Row: Scenario and Timer */}
      <div className="flex gap-6 items-start">
        <div className="flex-1">
          <ScenarioDisplay scenario={scenario} roundNumber={roundNumber} />
        </div>
        <div className="w-80">
          <Timer onTimeUp={handleTimeUp} isStopped={hasSubmitted} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main Content - Survival Strategy */}
        <div className="flex-1">
          {!hasSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass-card p-6 rounded-2xl border-0">
                <label className="block font-orbitron font-bold text-lg text-foreground mb-4 flex items-center">
                  <span className="w-3 h-3 bg-primary rounded-full mr-3"></span>
                  Your Survival Strategy
                </label>
                <textarea
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  placeholder="Describe your strategy to survive this scenario... Be detailed and creative!"
                  className="w-full h-40 p-4 glass-card bg-secondary/30 border-primary/20 text-foreground placeholder:text-muted-foreground resize-none rounded-xl focus:border-primary/50 focus:ring-primary/30 font-medium"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-muted-foreground">
                    {strategy.length}/500 characters
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Think fast, act smart!
                  </span>
                </div>
              </div>
              
              <Button
                type="submit"
                disabled={!strategy.trim()}
                className="btn-primary-glow w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
              >
                <span className="flex items-center justify-center space-x-2">
                  <span>📝</span>
                  <span>Submit Strategy</span>
                </span>
              </Button>
            </form>
          ) : (
            <div className="glass-card p-8 rounded-2xl border border-success/20 bg-success/5">
              <div className="text-center">
                <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <h3 className="text-2xl font-orbitron font-bold text-success mb-2">
                  Strategy Submitted!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your survival plan has been recorded. Analyzing all strategies...
                </p>
                <div className="w-3/4 mx-auto bg-muted/30 rounded-full h-2">
                  <div className="progress-glow h-2 rounded-full animate-pulse" style={{width: `${submissionProgress}%`}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Mission Status */}
        <div className="w-80">
          <div className="glass-card p-6 rounded-2xl border-0">
            <h4 className="font-orbitron font-bold text-lg text-foreground mb-4 flex items-center">
              <span className="w-2 h-2 bg-warning rounded-full mr-3 animate-pulse"></span>
              Mission Status
            </h4>
            
            <div className="space-y-4">
              {/* Progress Overview */}
              <div className="bg-secondary/30 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-foreground">Squad Progress</span>
                  <span className="text-sm font-mono text-primary">
                    {donePlayerIds.length}/{allPlayerIds.length}
                  </span>
                </div>
                <Progress value={submissionProgress} className="w-full mb-2" />
                <p className="text-xs text-muted-foreground text-center">
                  {submissionProgress === 100 ? 'All strategies submitted!' : 'Waiting for team members...'}
                </p>
              </div>
              
              {/* Player Status Grid */}
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-3">Team Status:</h5>
                <div className="space-y-2">
                  {players.map((player) => {
                    const isDone = gameState.playersDone?.[player.id];
                    const playerName = gameState.playerNames?.[player.id] || `Player ${player.id.slice(0, 4)}`;
                    const isCurrentPlayer = player.id === myPlayer()?.id;
                    return (
                      <div
                        key={player.id}
                        className={`glass-card p-3 rounded-lg border-l-4 transition-all duration-300 ${
                          isCurrentPlayer 
                            ? 'border-l-primary bg-primary/5' 
                            : isDone 
                            ? 'border-l-success bg-success/5' 
                            : 'border-l-warning bg-warning/5'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isDone ? 'status-online' : 'status-waiting'
                            }`}></div>
                            <span className="text-sm font-medium text-foreground">
                              {playerName}
                              {isCurrentPlayer && " (You)"}
                            </span>
                          </div>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-semibold ${
                              isDone
                                ? 'bg-success/20 text-success'
                                : 'bg-warning/20 text-warning'
                            }`}
                          >
                            {isDone ? '✓ Done' : '⏳ Working'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGameScreen;