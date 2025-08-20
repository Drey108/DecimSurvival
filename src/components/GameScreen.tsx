import { useState, useEffect } from 'react';
import Timer from './Timer';
import ScenarioDisplay from './ScenarioDisplay';

interface GameScreenProps {
  scenario: string;
  roundNumber: number;
  onStrategySubmit: (strategy: string) => void;
  isLoading: boolean;
  isMultiplayer?: boolean;
  multiplayerGameState?: any;
  setMultiplayerGameState?: (state: any) => void;
  players?: any[];
  currentPlayer?: any;
}

const GameScreen = ({ 
  scenario, 
  roundNumber, 
  onStrategySubmit, 
  isLoading, 
  isMultiplayer = false,
  multiplayerGameState,
  setMultiplayerGameState,
  players = [],
  currentPlayer
}: GameScreenProps) => {
  const [strategy, setStrategy] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const myPlayerId = currentPlayer?.id;

  // Reset state when round changes or phase changes
  useEffect(() => {
    if (isMultiplayer && multiplayerGameState?.phase === 'input') {
      setStrategy('');
      setSubmitted(false);
    }
  }, [isMultiplayer, multiplayerGameState?.currentRound, multiplayerGameState?.phase]);

  // Handle timer countdown for multiplayer games
  useEffect(() => {
    if (isMultiplayer && multiplayerGameState && setMultiplayerGameState && multiplayerGameState.timeLeft > 0) {
      const timer = setInterval(() => {
        setMultiplayerGameState(prev => ({
          ...prev,
          timeLeft: Math.max(0, prev.timeLeft - 1)
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isMultiplayer, multiplayerGameState?.currentRound, setMultiplayerGameState]);

  // Check if all players have submitted and trigger progression
  useEffect(() => {
    if (isMultiplayer && multiplayerGameState && setMultiplayerGameState && players.length > 0) {
      const allSubmitted = players.every(player => 
        multiplayerGameState.playerSubmissions[player.id]?.submitted
      );
      
      if (allSubmitted && multiplayerGameState.phase === 'input') {
        // All players submitted, trigger analysis phase
        setMultiplayerGameState({
          ...multiplayerGameState,
          phase: 'analyzing'
        });
      }
    }
  }, [isMultiplayer, multiplayerGameState?.playerSubmissions, players, setMultiplayerGameState]);

  // Update player typing status
  useEffect(() => {
    if (isMultiplayer && myPlayerId && !submitted && setMultiplayerGameState && multiplayerGameState) {
      const isTyping = strategy.length > 0;
      setMultiplayerGameState({
        ...multiplayerGameState,
        playerSubmissions: {
          ...multiplayerGameState.playerSubmissions,
          [myPlayerId]: {
            ...multiplayerGameState.playerSubmissions[myPlayerId],
            isTyping
          }
        }
      });
    }
  }, [strategy, isMultiplayer, myPlayerId, submitted, setMultiplayerGameState, multiplayerGameState]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (strategy.trim() && !submitted) {
      setSubmitted(true);
      
      if (isMultiplayer && myPlayerId && setMultiplayerGameState && multiplayerGameState) {
        // Update multiplayer state
        setMultiplayerGameState({
          ...multiplayerGameState,
          playerSubmissions: {
            ...multiplayerGameState.playerSubmissions,
            [myPlayerId]: {
              strategy: strategy.trim(),
              submitted: true,
              timeUp: false,
              isTyping: false
            }
          }
        });
      } else {
        // Single player - call the submit handler
        onStrategySubmit(strategy.trim());
      }
    }
  };

  const handleTimeUp = () => {
    if (!submitted) {
      setSubmitted(true);
      
      if (isMultiplayer && myPlayerId && setMultiplayerGameState && multiplayerGameState) {
        // Update multiplayer state for timeout
        setMultiplayerGameState({
          ...multiplayerGameState,
          playerSubmissions: {
            ...multiplayerGameState.playerSubmissions,
            [myPlayerId]: {
              strategy: strategy.trim(),
              submitted: true,
              timeUp: true,
              isTyping: false
            }
          }
        });
      } else {
        // Single player - call the submit handler
        if (strategy.trim()) {
          onStrategySubmit(strategy.trim());
        } else {
          onStrategySubmit('Time ran out! You panicked and couldn\'t form a strategy.');
        }
      }
    }
  };

  // Calculate submission progress
  const getSubmissionProgress = () => {
    const totalPlayers = players.length;
    const submittedCount = multiplayerGameState?.playerSubmissions 
      ? Object.values(multiplayerGameState.playerSubmissions).filter(
          (sub: any) => sub?.submitted
        ).length
      : 0;
    return { submitted: submittedCount, total: totalPlayers };
  };

  const { submitted: submittedCount, total: totalPlayers } = getSubmissionProgress();

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
          syncedTimeLeft={isMultiplayer ? multiplayerGameState?.timeLeft : undefined}
        />
      </div>

      {isMultiplayer && (
        <div className="mb-4 p-4 bg-card border border-border rounded">
          <h3 className="font-semibold mb-2">Player Progress ({submittedCount}/{totalPlayers})</h3>
          <div className="space-y-1">
            {players.map((player) => {
              const playerSub = multiplayerGameState?.playerSubmissions?.[player.id];
              const playerName = player.getProfile()?.name || `Player ${player.id}`;
              
              let status = '⏳ Writing...';
              if (playerSub?.submitted) {
                status = playerSub.timeUp ? '⏰ Time Up' : '✅ Submitted';
              } else if (playerSub?.isTyping) {
                status = '✏️ Typing...';
              }
              
              return (
                <div key={player.id} className="flex justify-between text-sm">
                  <span>{playerName}</span>
                  <span>{status}</span>
                </div>
              );
            })}
          </div>
          
          {submittedCount < totalPlayers && (
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