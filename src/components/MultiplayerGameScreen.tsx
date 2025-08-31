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
    <div className="flex gap-6">
      {/* Main Game Area */}
      <div className="flex-1">
        <ScenarioDisplay scenario={scenario} roundNumber={roundNumber} />
      
        {!hasSubmitted ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-semibold mb-2 text-foreground">
                Your Survival Strategy:
              </label>
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                placeholder="Describe your strategy to survive this scenario..."
                className="w-full h-32 p-3 border border-border rounded bg-input text-foreground resize-none"
              />
            </div>
            
            <Button
              type="submit"
              disabled={!strategy.trim()}
              className="w-full"
            >
              Submit Strategy
            </Button>
          </form>
        ) : (
          <div className="bg-card border border-border p-6 rounded">
            <h3 className="text-lg font-semibold mb-4 text-card-foreground">
              Strategy Submitted!
            </h3>
            <p className="text-muted-foreground">
              Waiting for other players to finish...
            </p>
          </div>
        )}
      </div>

      {/* Timer and Progress Sidebar - Moved to right */}
      <div className="w-80 space-y-4">
        <Timer onTimeUp={handleTimeUp} />
        
        {/* Progress Bar */}
        <div className="bg-card border border-border p-4 rounded">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-card-foreground">Player Progress</span>
            <span className="text-muted-foreground">
              {donePlayerIds.length}/{allPlayerIds.length}
            </span>
          </div>
          <Progress value={submissionProgress} className="w-full mb-4" />
          
          {/* Player Status List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Status:</h4>
            {players.map((player) => {
              const isDone = gameState.playersDone?.[player.id];
              const playerName = gameState.playerNames?.[player.id] || `Player ${player.id.slice(0, 4)}`;
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="text-card-foreground text-sm">
                    {playerName}
                    {player.id === myPlayer()?.id && " (You)"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted-foreground text-background'
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
  );
};

export default MultiplayerGameScreen;