import { useState } from 'react';
import { myPlayer, usePlayersList } from 'playroomkit';
import ScenarioDisplay from './ScenarioDisplay';

interface MultiplayerGameScreenProps {
  scenario: string;
  roundNumber: number;
  onStrategySubmit: (strategy: string) => void;
  submissions: Record<string, string>;
  phase: string;
}

const MultiplayerGameScreen = ({ 
  scenario, 
  roundNumber, 
  onStrategySubmit, 
  submissions,
  phase 
}: MultiplayerGameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const players = usePlayersList();
  const me = myPlayer();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !hasSubmitted) {
      onStrategySubmit(strategy.trim());
      setHasSubmitted(true);
    }
  };

  const submittedCount = Object.keys(submissions).length;
  const totalPlayers = players.length;
  const mySubmission = me ? submissions[me.id] : null;

  if (phase === 'evaluating') {
    return (
      <div className="text-center">
        <div className="text-xl mb-4">AI is analyzing all strategies...</div>
        <div className="text-muted-foreground">This may take a few seconds...</div>
      </div>
    );
  }

  return (
    <div>
      <ScenarioDisplay scenario={scenario} roundNumber={roundNumber} />
      
      {mySubmission ? (
        <div className="text-center">
          <div className="bg-card border border-border p-4 rounded mb-4">
            <h3 className="font-semibold mb-2 text-card-foreground">Your Strategy:</h3>
            <p className="text-card-foreground">{mySubmission}</p>
          </div>
          
          <div className="text-lg mb-4 text-foreground">
            Waiting for other players...
          </div>
          
          <div className="text-muted-foreground">
            {submittedCount}/{totalPlayers} players have submitted
          </div>
          
          <div className="mt-4">
            {players.map((player) => (
              <div key={player.id} className="flex justify-between items-center p-2 border-b border-border">
                <span className="text-foreground">
                  {player.getProfile()?.name || `Player ${player.id.slice(0, 6)}`}
                </span>
                <span className="text-sm">
                  {submissions[player.id] ? '✅ Submitted' : '⏳ Waiting...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
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
              disabled={hasSubmitted}
            />
          </div>
          
          <button
            type="submit"
            disabled={!strategy.trim() || hasSubmitted}
            className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Strategy
          </button>
          
          <div className="mt-4 text-center text-muted-foreground">
            {submittedCount}/{totalPlayers} players have submitted
          </div>
        </form>
      )}
    </div>
  );
};

export default MultiplayerGameScreen;