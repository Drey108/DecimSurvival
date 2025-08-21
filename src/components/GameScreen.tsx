import { useState } from 'react';
import ScenarioDisplay from './ScenarioDisplay';

interface GameScreenProps {
  scenario: string;
  roundNumber: number;
  onStrategySubmit: (strategy: string) => void;
  isLoading: boolean;
}

const GameScreen = ({ scenario, roundNumber, onStrategySubmit, isLoading }: GameScreenProps) => {
  const [strategy, setStrategy] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim()) {
      onStrategySubmit(strategy.trim());
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
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={!strategy.trim() || isLoading}
          className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Strategy
        </button>
      </form>
    </div>
  );
};

export default GameScreen;