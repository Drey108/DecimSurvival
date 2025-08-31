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
    <div className="leaderboard-screen">
      <div className="leaderboard-header text-center mb-8">
        <h2 className="page-title text-3xl font-bold mb-3 text-primary">
          {isGameComplete ? 'Final Leaderboard' : `Round ${roundNumber} Leaderboard`}
        </h2>
        <p className="page-subtitle text-muted-foreground text-lg">
          {isGameComplete 
            ? 'Game Complete!' 
            : `${totalRounds - roundNumber} rounds remaining`
          }
        </p>
      </div>

      <Card className="standings-card mb-8">
        <CardHeader className="card-header">
          <CardTitle className="card-title text-xl">Final Standings</CardTitle>
        </CardHeader>
        <CardContent className="card-content">
          <div className="rankings-list space-y-4">
            {leaderboardData.map((player, index) => {
              const position = index + 1;
              
              return (
                <div
                  key={player.playerId}
                  className={`ranking-item flex items-center justify-between p-4 rounded-lg ${
                    position === 1 
                      ? 'bg-warning/20 border-2 border-warning'
                      : position === 2
                      ? 'bg-muted border-2 border-muted-foreground'
                      : position === 3
                      ? 'bg-secondary/50 border-2 border-secondary'
                      : 'bg-secondary/20 border border-secondary'
                  }`}
                >
                  <div className="player-info flex items-center gap-4">
                    <span className="position text-xl font-bold text-primary">#{position}</span>
                    <span className="player-name font-semibold text-lg">
                      {player.name}
                      {position === 1 && ' 👑'}
                    </span>
                  </div>
                  <div className="score-info flex items-center gap-3">
                    <span className="score text-xl font-bold text-primary">{player.score}</span>
                    <span className="score-label text-sm text-muted-foreground">
                      {player.score === 1 ? 'survival' : 'survivals'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="actions-section text-center">
        {isHost ? (
          <Button onClick={handleNext} className="menu-button px-8 py-3">
            Back to Menu
          </Button>
        ) : (
          <p className="waiting-text text-muted-foreground text-lg">
            Waiting for host to return to menu...
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerLeaderboard;