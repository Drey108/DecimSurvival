import { useState } from 'react';
import Timer from './Timer';
import ScenarioDisplay from './ScenarioDisplay';

interface GameScreenProps {
  scenario: string;
  roundNumber: number;
  onStrategySubmit: (strategy: string) => void;
  isLoading: boolean;
}

const GameScreen = ({ scenario, roundNumber, onStrategySubmit, isLoading }: GameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [timeUp, setTimeUp] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim()) {
      onStrategySubmit(strategy.trim());
    }
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    if (strategy.trim()) {
      onStrategySubmit(strategy.trim());
    } else {
      onStrategySubmit('No strategy provided - panicked and did nothing.');
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
          isActive={!timeUp && !isLoading} 
        />
      </div>

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
            disabled={timeUp || isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!strategy.trim() || timeUp || isLoading}
          className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Strategy
        </button>
      </form>

      {timeUp && !strategy.trim() && (
        <p className="text-warning mt-2">Time's up! You panicked and couldn't think of a strategy.</p>
      )}
    </div>
  );
};

export default GameScreen;