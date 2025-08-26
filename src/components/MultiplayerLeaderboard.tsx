import { usePlayersList, useIsHost } from 'playroomkit';

interface MultiplayerLeaderboardProps {
  leaderboard: Record<string, number>;
  currentRound: number;
  onNextRound: () => void;
  onFinishGame: () => void;
}

const MultiplayerLeaderboard = ({ 
  leaderboard, 
  currentRound, 
  onNextRound, 
  onFinishGame 
}: MultiplayerLeaderboardProps) => {
  const players = usePlayersList();
  const isHost = useIsHost();

  // Sort players by score (descending)
  const sortedPlayers = players
    .map(player => ({
      id: player.id,
      name: player.getProfile()?.name || `Player ${player.id.slice(0, 6)}`,
      score: leaderboard[player.id] || 0
    }))
    .sort((a, b) => b.score - a.score);

  const isLastRound = currentRound >= 3;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        {isLastRound ? 'Final Leaderboard' : `Leaderboard - After Round ${currentRound}`}
      </h2>
      
      <div className="bg-card border border-border p-6 rounded mb-6">
        <div className="space-y-3">
          {sortedPlayers.map((player, index) => (
            <div 
              key={player.id} 
              className={`flex justify-between items-center p-3 rounded ${
                index === 0 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-card-foreground">
                  #{index + 1}
                </span>
                <span className="text-card-foreground">{player.name}</span>
                {index === 0 && <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">LEADER</span>}
              </div>
              <span className="text-lg font-bold text-card-foreground">
                {player.score}/{currentRound}
              </span>
            </div>
          ))}
        </div>
      </div>

      {isHost && (
        <div className="space-y-4">
          {isLastRound ? (
            <button
              onClick={onFinishGame}
              className="bg-primary text-primary-foreground px-8 py-3 rounded text-lg hover:opacity-90"
            >
              End Game
            </button>
          ) : (
            <button
              onClick={onNextRound}
              className="bg-primary text-primary-foreground px-8 py-3 rounded text-lg hover:opacity-90"
            >
              Start Round {currentRound + 1}
            </button>
          )}
        </div>
      )}
      
      {!isHost && (
        <div className="text-muted-foreground">
          {isLastRound 
            ? 'Waiting for host to end the game...' 
            : `Waiting for host to start round ${currentRound + 1}...`
          }
        </div>
      )}
    </div>
  );
};

export default MultiplayerLeaderboard;