import { useState, useEffect } from 'react';
import { usePlayersList, useMultiplayerState, myPlayer } from 'playroomkit';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import ScenarioDisplay from './ScenarioDisplay';

interface MultiplayerGameScreenProps {
  scenario: string;
  roundNumber: number;
  onAdvanceToVerdicts: () => void;
}

const MultiplayerGameScreen = ({ scenario, roundNumber, onAdvanceToVerdicts }: MultiplayerGameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const players = usePlayersList(true);
  const [gameState, setGameState] = useMultiplayerState('game', {
    phase: 'collectingSubmissions',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    submissions: {},
    verdicts: {},
    scores: {}
  });

  // Check if all players have submitted
  useEffect(() => {
    const allPlayerIds = players.map(p => p.id);
    const submittedPlayerIds = Object.keys(gameState.submissions || {});
    const allSubmitted = allPlayerIds.length > 0 && 
                        allPlayerIds.every(id => submittedPlayerIds.includes(id));
    
    if (allSubmitted && gameState.phase === 'collectingSubmissions') {
      // Auto-advance to verdicts phase
      setTimeout(() => {
        onAdvanceToVerdicts();
      }, 1000);
    }
  }, [gameState.submissions, players, gameState.phase, onAdvanceToVerdicts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !hasSubmitted) {
      const myPlayerId = myPlayer()?.id;
      if (myPlayerId) {
        // Update submissions in global state
        setGameState({
          ...gameState,
          submissions: {
            ...gameState.submissions,
            [myPlayerId]: strategy.trim()
          }
        });
        setHasSubmitted(true);
      }
    }
  };

  // Get submission progress
  const allPlayerIds = players.map(p => p.id);
  const submittedPlayerIds = Object.keys(gameState.submissions || {});
  const submissionProgress = (submittedPlayerIds.length / Math.max(allPlayerIds.length, 1)) * 100;

  return (
    <div>
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
          <p className="text-muted-foreground mb-4">
            Waiting for other players to submit their strategies...
          </p>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-card-foreground">Submission Progress</span>
              <span className="text-muted-foreground">
                {submittedPlayerIds.length}/{allPlayerIds.length}
              </span>
            </div>
            <Progress value={submissionProgress} className="w-full" />
          </div>

          {/* Player Status List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-card-foreground">Player Status:</h4>
            {players.map((player) => {
              const hasPlayerSubmitted = submittedPlayerIds.includes(player.id);
              return (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2 bg-muted rounded"
                >
                  <span className="text-card-foreground">
                    {player.getProfile()?.name || `Player ${player.id.slice(0, 4)}`}
                    {player.id === myPlayer()?.id && " (You)"}
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      hasPlayerSubmitted
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted-foreground text-background'
                    }`}
                  >
                    {hasPlayerSubmitted ? 'Submitted' : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerGameScreen;