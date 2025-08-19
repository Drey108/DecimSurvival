import { useState, useEffect } from 'react';
import { usePlayersList, useMultiplayerState, myPlayer } from 'playroomkit';
import Timer from './Timer';
import ScenarioDisplay from './ScenarioDisplay';
import type { GameState, PlayerStrategy } from '../types/multiplayer';

interface MultiplayerGameScreenProps {
  onAllStrategiesSubmitted: () => void;
}

const MultiplayerGameScreen = ({ onAllStrategiesSubmitted }: MultiplayerGameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const players = usePlayersList(true);
  const defaultGameState: GameState = {
    phase: 'lobby',
    currentRound: 1,
    scenario: '',
    timeLeft: 60,
    currentResultIndex: 0,
    hostApiKey: ''
  };
  const [gameState] = useMultiplayerState('gameState', defaultGameState);
  const [playerStrategies, setPlayerStrategies] = useMultiplayerState('playerStrategies', {} as Record<string, PlayerStrategy>);

  const currentPlayer = myPlayer();

  useEffect(() => {
    // Check if all players have submitted strategies
    if (playerStrategies && players.length > 0) {
      const submittedCount = Object.keys(playerStrategies).length;
      if (submittedCount === players.length) {
        onAllStrategiesSubmitted();
      }
    }
  }, [playerStrategies, players.length, onAllStrategiesSubmitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !submitted) {
      submitStrategy(strategy.trim());
    }
  };

  const submitStrategy = (strategyText: string) => {
    setSubmitted(true);
    const newStrategies = {
      ...playerStrategies,
      [currentPlayer.id]: {
        playerId: currentPlayer.id,
        playerName: currentPlayer.getProfile()?.name || 'Unknown',
        strategy: strategyText
      }
    };
    setPlayerStrategies(newStrategies);
  };

  const handleTimeUp = () => {
    setTimeUp(true);
    if (!submitted) {
      const strategyText = strategy.trim() || 'No strategy provided - panicked and did nothing.';
      submitStrategy(strategyText);
    }
  };

  const submittedPlayers = playerStrategies ? Object.keys(playerStrategies) : [];
  const waitingFor = players.filter(p => !submittedPlayers.includes(p.id));

  return (
    <div>
      <ScenarioDisplay scenario={gameState?.scenario || ''} roundNumber={gameState?.currentRound || 1} />
      
      <div className="mb-4">
        <Timer 
          duration={60} 
          onTimeUp={handleTimeUp} 
          isActive={!timeUp && !submitted} 
        />
      </div>

      {!submitted ? (
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
              disabled={timeUp || submitted}
            />
          </div>
          
          <button
            type="submit"
            disabled={!strategy.trim() || timeUp || submitted}
            className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Strategy
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="bg-card border border-border p-4 rounded mb-4">
            <h3 className="font-semibold text-card-foreground mb-2">Strategy Submitted!</h3>
            <p className="text-muted-foreground">Waiting for other players...</p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">Player Status:</h4>
            {players.map(player => (
              <div key={player.id} className="flex justify-between items-center p-2 border border-border rounded">
                <span className="text-foreground">
                  {player.getProfile()?.name || 'Unknown'}
                </span>
                <span className={`text-sm ${
                  submittedPlayers.includes(player.id) ? 'text-success' : 'text-warning'
                }`}>
                  {submittedPlayers.includes(player.id) ? '✓ Submitted' : 'Thinking...'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {timeUp && !strategy.trim() && !submitted && (
        <p className="text-warning mt-2">Time's up! You panicked and couldn't think of a strategy.</p>
      )}
    </div>
  );
};

export default MultiplayerGameScreen;