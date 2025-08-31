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
    playersDone: {}
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
        // Update submissions and mark player as done
        setGameState({
          ...gameState,
          submissions: {
            ...gameState.submissions,
            [myPlayerId]: strategy.trim()
          },
          playersDone: {
            ...gameState.playersDone,
            [myPlayerId]: true
          }
        });
        setHasSubmitted(true);
      }
    }
  };

  const handleTimeUp = () => {
    const myPlayerId = myPlayer()?.id;
    if (myPlayerId && !hasSubmitted) {
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
    <div className="game-screen flex gap-8">
      <div className="main-area flex-1">
        <ScenarioDisplay scenario={scenario} roundNumber={roundNumber} />
      
        {!hasSubmitted ? (
          <form className="strategy-form" onSubmit={handleSubmit}>
            <div className="input-section mb-6">
              <label className="field-label block font-semibold mb-3 text-foreground">
                Your Survival Strategy
              </label>
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Describe your strategy to survive this scenario..."
                className="strategy-input w-full h-40 p-4 border border-border rounded-lg bg-input text-foreground resize-none"
              />
            </div>
            
            <Button
              type="submit"
              disabled={!strategy.trim()}
              className="submit-button w-full py-3"
            >
              Submit Strategy
            </Button>
          </form>
        ) : (
          <div className="submitted-card bg-card border border-border p-6 rounded-lg">
            <h3 className="card-title text-lg font-semibold mb-3 text-primary">
              Strategy Submitted!
            </h3>
            <p className="card-text text-muted-foreground">
              Waiting for other players to finish...
            </p>
          </div>
        )}
      </div>

      <div className="sidebar w-80 space-y-6">
        <Timer onTimeUp={handleTimeUp} />
        
        <div className="progress-card bg-card border border-border p-5 rounded-lg">
          <div className="progress-header flex justify-between text-sm mb-3">
            <span className="progress-label text-card-foreground font-medium">Player Progress</span>
            <span className="progress-count text-muted-foreground">
              {donePlayerIds.length}/{allPlayerIds.length}
            </span>
          </div>
          <Progress value={submissionProgress} className="progress-bar w-full mb-5" />
          
          <div className="status-section">
            <h4 className="status-title text-sm font-medium text-card-foreground mb-3">Player Status</h4>
            <div className="status-list space-y-2">
              {players.map((player) => {
                const isDone = gameState.playersDone?.[player.id];
                const playerName = gameState.playerNames?.[player.id] || `Player ${player.id.slice(0, 4)}`;
                return (
                  <div
                    key={player.id}
                    className="status-item flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <span className="player-name text-card-foreground text-sm font-medium">
                      {playerName}
                      {player.id === myPlayer()?.id && " (You)"}
                    </span>
                    <span
                      className={`status-badge text-xs px-3 py-1 rounded-full font-medium ${
                        isDone
                          ? 'bg-success text-success-foreground'
                          : 'bg-warning text-warning-foreground'
                      }`}
                    >
                      {isDone ? 'Done' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerGameScreen;