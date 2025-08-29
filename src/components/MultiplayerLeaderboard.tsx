import { usePlayersList, useMultiplayerState } from 'playroomkit';
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
  const players = usePlayersList(true);
  const [gameState] = useMultiplayerState('game', {
    phase: 'showingLeaderboard',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    submissions: {},
    verdicts: {},
    scores: {}
  });

  // Sort players by score (descending)
  const sortedPlayers = players
    .map(player => ({
      ...player,
      score: gameState.scores?.[player.id] || 0
    }))
    .sort((a, b) => b.score - a.score);

  const isGameComplete = roundNumber >= totalRounds;

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
            {sortedPlayers.map((player, index) => {
              const playerName = player.getProfile()?.name || `Player ${player.id.slice(0, 4)}`;
              const position = index + 1;
              
              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded ${
                    position === 1 
                      ? 'bg-yellow-100 border border-yellow-300 dark:bg-yellow-900 dark:border-yellow-700'
                      : position === 2
                      ? 'bg-gray-100 border border-gray-300 dark:bg-gray-800 dark:border-gray-600'
                      : position === 3
                      ? 'bg-orange-100 border border-orange-300 dark:bg-orange-900 dark:border-orange-700'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold">#{position}</span>
                    <span className="font-medium">
                      {playerName}
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
            {isGameComplete ? 'End Game' : 'Next Round'}
          </Button>
        ) : (
          <p className="text-muted-foreground">
            {isGameComplete 
              ? 'Waiting for host to end the game...'
              : 'Waiting for host to start next round...'
            }
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLeaderboard;