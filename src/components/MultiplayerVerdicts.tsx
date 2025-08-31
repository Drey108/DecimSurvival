import { usePlayersList, useMultiplayerState } from 'playroomkit';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MultiplayerVerdictsProps {
  scenario: string;
  roundNumber: number;
  onAdvanceToLeaderboard: () => void;
  isHost: boolean;
}

const MultiplayerVerdicts = ({ scenario, roundNumber, onAdvanceToLeaderboard, isHost }: MultiplayerVerdictsProps) => {
  const players = usePlayersList(true);
  const [gameState] = useMultiplayerState('game', {
    phase: 'showingVerdicts',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    submissions: {},
    verdicts: {},
    scores: {}
  });

  const handleContinue = () => {
    if (isHost) {
      onAdvanceToLeaderboard();
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Round {roundNumber} Results</h2>
        <div className="bg-card border border-border p-4 rounded">
          <h3 className="text-lg font-semibold mb-2 text-card-foreground">Scenario:</h3>
          <p className="text-muted-foreground">{scenario}</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {players.map((player) => {
          const playerId = player.id;
          const playerName = player.getProfile()?.name || `Player ${playerId.slice(0, 4)}`;
          const submission = gameState.submissions?.[playerId] || 'No strategy submitted';
          const verdict = gameState.verdicts?.[playerId];

          return (
            <Card key={playerId} className="w-full">
              <CardHeader>
                <CardTitle className="text-lg">
                  {playerName}
                  {verdict && (
                    <span
                      className={`ml-2 text-sm px-2 py-1 rounded ${
                        verdict.survived
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {verdict.survived ? 'SURVIVED' : 'DIED'}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground mb-1">Strategy:</h4>
                    <p className="text-sm bg-muted p-2 rounded">{submission}</p>
                  </div>
                  {verdict && (
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-1">AI Verdict:</h4>
                      <p className="text-sm">{verdict.narrative}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="text-center">
        {isHost ? (
          <Button onClick={handleContinue} className="px-8 py-3">
            {roundNumber >= 3 ? 'Continue to Leaderboard' : 'Continue to Next Round'}
          </Button>
        ) : (
          <p className="text-muted-foreground">
            Waiting for host to continue...
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerVerdicts;