import { useState, useEffect } from 'react';
import ScenarioDisplay from './ScenarioDisplay';
import SinglePlayerTimer from './SinglePlayerTimer';

interface GameScreenProps {
  scenario: string;
  roundNumber: number;
  onStrategySubmit: (strategy: string) => void;
  isLoading: boolean;
}

const GameScreen = ({ scenario, roundNumber, onStrategySubmit, isLoading }: GameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timerActive, setTimerActive] = useState(true);

  // Reset timer when scenario changes
  useEffect(() => {
    setTimerActive(true);
    setHasSubmitted(false);
    setStrategy('');
  }, [scenario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !hasSubmitted) {
      setHasSubmitted(true);
      setTimerActive(false);
      onStrategySubmit(strategy.trim());
    }
  };

  const handleTimeUp = () => {
    if (!hasSubmitted) {
      setHasSubmitted(true);
      setTimerActive(false);
      onStrategySubmit(strategy.trim() || ''); // Submit whatever they have, even if empty
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
      <div className="flex justify-between items-center mb-4">
        <div>
          <ScenarioDisplay scenario={scenario} roundNumber={roundNumber} />
        </div>
        <SinglePlayerTimer 
          onTimeUp={handleTimeUp} 
          isActive={timerActive && !isLoading} 
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
            disabled={isLoading || hasSubmitted}
          />
        </div>
        
        <button
          type="submit"
          disabled={!strategy.trim() || isLoading || hasSubmitted}
          className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {hasSubmitted ? 'Strategy Submitted' : 'Submit Strategy'}
        </button>
      </form>
    </div>
  );
};

export default GameScreen;