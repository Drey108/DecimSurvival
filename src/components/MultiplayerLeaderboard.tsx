import { useIsHost, useMultiplayerState } from 'playroomkit';
import type { GameState, PlayerScore } from '../types/multiplayer';

interface MultiplayerLeaderboardProps {
  onNextRound: () => void;
  onFinishGame: () => void;
  isFinal?: boolean;
}

const MultiplayerLeaderboard = ({ onNextRound, onFinishGame, isFinal = false }: MultiplayerLeaderboardProps) => {
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
  const [playerScores] = useMultiplayerState('playerScores', {} as Record<string, PlayerScore>);

  if (!playerScores || !gameState) return null;

  const sortedPlayers = Object.entries(playerScores)
    .map(([playerId, data]: [string, any]) => ({
      playerId,
      name: data.name,
      score: data.score
    }))
    .sort((a, b) => b.score - a.score);

  const currentRound = gameState.currentRound || 1;
  const maxScore = isFinal ? 3 : currentRound;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4 text-foreground">
        {isFinal ? 'Final Results' : `Round ${currentRound} Leaderboard`}
      </h2>
      
      <div className="bg-card border border-border p-6 rounded mb-6">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.playerId}
              className={`flex justify-between items-center p-3 rounded border ${
                index === 0 && isFinal 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-background'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold text-foreground">
                  #{index + 1}
                </span>
                <span className="text-foreground">
                  {player.name}
                  {index === 0 && isFinal && ' 🏆'}
                </span>
              </div>
              <span className="text-xl font-bold text-foreground">
                {player.score}/{maxScore}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isFinal && (
        <div className="mb-4">
          <p className="text-muted-foreground">
            {sortedPlayers[0]?.score === 3 && "Perfect game! Amazing survival skills!"}
            {sortedPlayers[0]?.score === 2 && "Great performance! Strong survivor!"}
            {sortedPlayers[0]?.score === 1 && "Good effort! Room for improvement."}
            {sortedPlayers[0]?.score === 0 && "Better luck next time!"}
          </p>
        </div>
      )}
      
      {isHost && (
        <button
          onClick={isFinal ? onFinishGame : onNextRound}
          className="bg-primary text-primary-foreground px-6 py-3 rounded hover:opacity-90"
        >
          {isFinal ? 'Play Again' : `Start Round ${currentRound + 1}`}
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

export default MultiplayerLeaderboard;