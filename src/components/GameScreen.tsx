import { useState } from 'react';
import Timer from './Timer';
import ScenarioDisplay from './ScenarioDisplay';

interface GameScreenProps {
  scenario: string;
  roundNumber: number;
  onStrategySubmit: (strategy: string) => void;
  isLoading: boolean;
  isMultiplayer?: boolean;
  playerProgress?: {
    submitted: number;
    total: number;
    players: Array<{
      id: string;
      name: string;
      status: string;
    }>;
  };
  syncedTimeLeft?: number;
}

const GameScreen = ({ scenario, roundNumber, onStrategySubmit, isLoading, isMultiplayer = false, playerProgress, syncedTimeLeft }: GameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !submitted) {
      setSubmitted(true);
      onStrategySubmit(strategy.trim());
    }
  };

  const handleTimeUp = () => {
    if (!submitted) {
      setSubmitted(true);
      if (strategy.trim()) {
        onStrategySubmit(strategy.trim());
      } else {
        onStrategySubmit('Time ran out! You panicked and couldn\'t form a strategy.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <div className="text-xl mb-4">AI is analyzing your strategy...</div>
        <div className="text-muted-foreground">This may take a few seconds...</div>
      </div>
    );
  }

  return (
    <div>
      <ScenarioDisplay scenario={scenario} roundNumber={roundNumber} />
      
      <div className="mb-4">
        <Timer 
          duration={60} 
          onTimeUp={handleTimeUp} 
          isActive={!submitted && !isLoading}
          syncedTimeLeft={syncedTimeLeft}
        />
      </div>

      {isMultiplayer && playerProgress && (
        <div className="mb-4 p-4 bg-card border border-border rounded">
          <h3 className="font-semibold mb-2">Player Progress ({playerProgress.submitted}/{playerProgress.total})</h3>
          <div className="space-y-1">
            {playerProgress.players.map((player) => (
              <div key={player.id} className="flex justify-between text-sm">
                <span>{player.name}</span>
                <span>{player.status}</span>
              </div>
            ))}
          </div>
          
          {playerProgress.submitted < playerProgress.total && (
            <p className="text-sm text-muted-foreground mt-2">
              Waiting for all players to submit...
            </p>
          )}
        </div>
      )}

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
            disabled={submitted || isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!strategy.trim() || submitted || isLoading}
          className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitted ? 'Strategy Submitted' : 'Submit Strategy'}
        </button>
      </form>

      {submitted && !strategy.trim() && (
        <p className="text-destructive mt-2">Time's up! You panicked and couldn't think of a strategy.</p>
      )}
    </div>
  );
};

export default GameScreen;