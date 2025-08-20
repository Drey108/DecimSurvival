import { Button } from '@/components/ui/button';

interface PlayerStats {
  playerId: string;
  playerName: string;
  survivals: number;
  totalRounds: number;
}

interface MultiplayerFinalResultsProps {
  playerStats: PlayerStats[];
  onPlayAgain: () => void;
  onLeaveGame: () => void;
  isHost: boolean;
}

const MultiplayerFinalResults = ({ 
  playerStats, 
  onPlayAgain, 
  onLeaveGame, 
  isHost 
}: MultiplayerFinalResultsProps) => {
  // Sort players by survival count (highest first)
  const sortedStats = [...playerStats].sort((a, b) => b.survivals - a.survivals);
  const winner = sortedStats[0];
  const maxSurvivals = winner?.survivals || 0;
  const winners = sortedStats.filter(p => p.survivals === maxSurvivals);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-foreground">Final Results</h2>
        
        {winners.length === 1 ? (
          <div className="bg-card border border-border p-6 rounded mb-6">
            <div className="text-2xl font-bold text-yellow-500 mb-2">🏆 Winner!</div>
            <div className="text-xl font-semibold text-card-foreground">{winner.playerName}</div>
            <div className="text-lg text-muted-foreground">{winner.survivals}/3 Survivals</div>
          </div>
        ) : (
          <div className="bg-card border border-border p-6 rounded mb-6">
            <div className="text-2xl font-bold text-yellow-500 mb-2">🏆 Tie!</div>
            <div className="text-lg text-card-foreground">
              {winners.map(w => w.playerName).join(' & ')} 
            </div>
            <div className="text-lg text-muted-foreground">{maxSurvivals}/3 Survivals Each</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-center text-foreground">Leaderboard</h3>
        {sortedStats.map((stats, index) => (
          <div
            key={stats.playerId}
            className={`flex justify-between items-center p-4 border border-border rounded bg-card ${
              index === 0 && sortedStats[0].survivals > 0 ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-muted-foreground">
                #{index + 1}
              </span>
              <span className="font-semibold text-card-foreground">
                {stats.playerName}
              </span>
            </div>
            <div className="text-right">
              <div className="font-bold text-card-foreground">
                {stats.survivals}/3
              </div>
              <div className="text-sm text-muted-foreground">survivals</div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 text-center">
        {isHost && (
          <Button onClick={onPlayAgain} className="w-full">
            Play Again
          </Button>
        )}
        
        <Button 
          onClick={onLeaveGame} 
          variant="outline" 
          className="w-full"
        >
          Leave Game
        </Button>

        {isHost && (
          <p className="text-sm text-muted-foreground">
            As host, you can start a new game for all players
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerFinalResults;