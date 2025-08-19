import { useIsHost, useMultiplayerState } from 'playroomkit';
import type { GameState, PlayerResult } from '../types/multiplayer';

interface ResultsViewerProps {
  onNextResult: () => void;
  onFinishResults: () => void;
}

const ResultsViewer = ({ onNextResult, onFinishResults }: ResultsViewerProps) => {
  const isHost = useIsHost();
  const defaultGameState: GameState = {
    phase: 'lobby',
    currentRound: 1,
    scenario: '',
    timeLeft: 60,
    currentResultIndex: 0,
    hostApiKey: ''
  };
  const [gameState] = useMultiplayerState('gameState', defaultGameState);
  const [roundResults] = useMultiplayerState('roundResults', [] as PlayerResult[]);

  if (!roundResults || !gameState) return null;

  const currentIndex = gameState.currentResultIndex || 0;
  const currentResult = roundResults[currentIndex];
  const isLastResult = currentIndex >= roundResults.length - 1;

  if (!currentResult) return null;

  return (
    <div className="text-center">
      <h2 className="text-xl font-bold mb-4 text-foreground">
        Player Results ({currentIndex + 1}/{roundResults.length})
      </h2>
      
      <div className="bg-card border border-border p-6 rounded mb-4">
        <h3 className="font-semibold mb-2 text-card-foreground">
          {currentResult.playerName}
        </h3>
        
        <div className="mb-4 p-3 bg-background border border-border rounded">
          <p className="text-sm text-muted-foreground mb-2">Strategy:</p>
          <p className="text-foreground italic">"{currentResult.strategy}"</p>
        </div>
        
        <p className="text-card-foreground mb-4">{currentResult.narrative}</p>
        
        <div className={`text-2xl font-bold ${
          currentResult.survived ? 'text-success' : 'text-destructive'
        }`}>
          {currentResult.survived ? 'SURVIVED!' : 'DIED!'}
        </div>
      </div>
      
      {isHost && (
        <button
          onClick={isLastResult ? onFinishResults : onNextResult}
          className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90"
        >
          {isLastResult ? 'View Leaderboard' : 'Next Player'}
        </button>
      )}

      {!isHost && (
        <p className="text-muted-foreground">
          Waiting for host to continue...
        </p>
      )}
    </div>
  );
};

export default ResultsViewer;