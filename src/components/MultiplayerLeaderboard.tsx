import { useMultiplayerState, usePlayersList } from 'playroomkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MultiplayerLeaderboardProps {
  roundNumber: number;
  onNextRound: () => void;
  onEndGame: () => void;
  isHost: boolean;
  totalRounds: number;
}

const MultiplayerLeaderboard = ({ 
  roundNumber, 
  onNextRound, 
  onEndGame, 
  isHost, 
  totalRounds 
}: MultiplayerLeaderboardProps) => {
  const [gameState] = useMultiplayerState('game', {
    phase: 'showingLeaderboard',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    submissions: {},
    verdicts: {},
    scores: {},
    playerNames: {},
    leaderboard: []
  });

  const players = usePlayersList(true);

  // Ensure all players are shown in leaderboard with their scores
  const leaderboardData = gameState.leaderboard?.length > 0 
    ? gameState.leaderboard
    : players.map(player => ({
        playerId: player.id,
        name: gameState.playerNames?.[player.id] || `Player ${player.id.slice(0, 4)}`,
        score: gameState.scores?.[player.id] || 0
      }))
      .sort((a, b) => b.score - a.score);

  const isGameComplete = true; // Always show final leaderboard after 3 rounds

  const handleNext = () => {
    if (isHost) {
      if (isGameComplete) {
        onEndGame();
      } else {
        onNextRound();
      }
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          {isGameComplete ? 'Final Leaderboard' : `Round ${roundNumber} Leaderboard`}
        </h2>
        <p className="text-muted-foreground">
          {isGameComplete 
            ? 'Game Complete!' 
            : `${totalRounds - roundNumber} rounds remaining`
          }
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Standings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboardData.map((player, index) => {
              const position = index + 1;
              
              return (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between p-3 rounded ${
                    position === 1 
                      ? 'bg-yellow-500/20 border-2 border-yellow-500 text-yellow-900 dark:text-yellow-200'
                      : position === 2
                      ? 'bg-gray-400/20 border-2 border-gray-400 text-gray-900 dark:text-gray-200'
                      : position === 3
                      ? 'bg-amber-600/20 border-2 border-amber-600 text-amber-900 dark:text-amber-200'
                      : 'bg-secondary/20 border border-secondary text-secondary-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">#{position}</span>
                    <span className="font-medium">
                      {player.name}
                      {position === 1 && ' 👑'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{player.score}</span>
                    <span className="text-sm text-muted-foreground">
                      {player.score === 1 ? 'survival' : 'survivals'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        {isHost ? (
          <Button onClick={handleNext} className="px-8 py-3">
            Back to Menu
          </Button>
        ) : (
          <p className="text-muted-foreground">
            Waiting for host to return to menu...
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLeaderboard;