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

  const getTrophyEmoji = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '🎖️';
  };

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500 text-yellow-900 dark:text-yellow-200 shadow-lg shadow-yellow-500/20';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400 text-gray-900 dark:text-gray-200 shadow-lg shadow-gray-400/20';
      case 3:
        return 'bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-amber-600 text-amber-900 dark:text-amber-200 shadow-lg shadow-amber-600/20';
      default:
        return 'bg-secondary/20 border-muted text-secondary-foreground';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-12">
        <div className="glass-card p-12 rounded-3xl border-0">
          <div className="w-32 h-32 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-float">
            <span className="text-6xl">🏆</span>
          </div>
          <h2 className="text-5xl font-orbitron font-black text-primary mb-4">
            {isGameComplete ? 'MISSION COMPLETE' : `ROUND ${roundNumber}`}
          </h2>
          <h3 className="text-2xl font-orbitron font-bold text-foreground mb-6">
            Survival Leaderboard
          </h3>
          <p className="text-lg text-muted-foreground">
            {isGameComplete 
              ? 'Final rankings of the ultimate survivors!' 
              : `${totalRounds - roundNumber} rounds remaining in the survival challenge`
            }
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-4 mb-12">
        {leaderboardData.map((player, index) => {
          const position = index + 1;
          
          return (
            <div
              key={player.playerId}
              className={`glass-card p-6 rounded-2xl border-2 transition-all duration-300 card-hover ${getPositionStyle(position)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  {/* Position & Trophy */}
                  <div className="flex items-center space-x-3">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-orbitron font-black text-2xl ${
                      position <= 3 ? 'bg-card/50 backdrop-blur-sm' : 'bg-muted/30'
                    }`}>
                      {getTrophyEmoji(position)}
                    </div>
                    <div className="text-left">
                      <div className="text-2xl font-orbitron font-black">
                        #{position}
                      </div>
                      <div className="text-sm text-muted-foreground font-semibold">
                        {position === 1 ? 'CHAMPION' : position === 2 ? 'RUNNER-UP' : position === 3 ? 'BRONZE' : 'SURVIVOR'}
                      </div>
                    </div>
                  </div>

                  {/* Player Name */}
                  <div>
                    <h3 className="text-2xl font-orbitron font-bold">
                      {player.name}
                    </h3>
                    {position === 1 && (
                      <p className="text-sm text-muted-foreground font-semibold">
                        🎯 Ultimate Survivor
                      </p>
                    )}
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-4xl font-orbitron font-black">
                        {player.score}
                      </div>
                      <div className="text-sm text-muted-foreground font-semibold">
                        {player.score === 1 ? 'SURVIVAL' : 'SURVIVALS'}
                      </div>
                    </div>
                    
                    {position === 1 && (
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center animate-glow-pulse">
                        <span className="text-2xl">👑</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Achievement Bar for Top 3 */}
              {position <= 3 && (
                <div className="mt-4 pt-4 border-t border-border/30">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-semibold">
                      Survival Rate: {Math.round((player.score / 3) * 100)}%
                    </span>
                    <div className="flex space-x-1">
                      {[...Array(3)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full ${
                            i < player.score 
                              ? 'bg-success animate-pulse' 
                              : 'bg-muted/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Section */}
      <div className="text-center">
        <div className="glass-card p-8 rounded-2xl border-0">
          {isHost ? (
            <div className="space-y-4">
              <h4 className="text-xl font-orbitron font-bold text-foreground mb-4">
                Mission Status: Complete
              </h4>
              <Button 
                onClick={handleNext} 
                className="btn-primary-glow px-12 py-4 text-xl font-bold rounded-xl"
              >
                <span className="flex items-center space-x-3">
                  <span>🚀</span>
                  <span>Return to Command Center</span>
                </span>
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <div className="w-10 h-10 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2">Mission Debriefing</h4>
              <p className="text-muted-foreground">
                Awaiting mission commander's final orders...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLeaderboard;