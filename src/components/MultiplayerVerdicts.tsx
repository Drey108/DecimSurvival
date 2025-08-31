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
    <div className="results-screen">
      <div className="results-header text-center mb-8">
        <h2 className="page-title text-3xl font-bold mb-4 text-primary">Round {roundNumber} Results</h2>
        <div className="scenario-card bg-card border border-border p-5 rounded-lg">
          <h3 className="card-title text-lg font-semibold mb-2 text-primary">Scenario</h3>
          <p className="scenario-text text-muted-foreground">{scenario}</p>
        </div>
      </div>

      <div className="verdicts-list space-y-5 mb-8">
        {players.map((player) => {
          const playerId = player.id;
          const playerName = player.getProfile()?.name || `Player ${playerId.slice(0, 4)}`;
          const submission = gameState.submissions?.[playerId] || 'No strategy submitted';
          const verdict = gameState.verdicts?.[playerId];

          return (
            <Card key={playerId} className="verdict-card">
              <CardHeader className="card-header pb-3">
                <CardTitle className="player-title text-xl flex items-center">
                  <span className="player-name">{playerName}</span>
                  {verdict && (
                    <span
                      className={`result-badge ml-3 text-sm px-3 py-1 rounded-full font-medium ${
                        verdict.survived
                          ? 'bg-success text-success-foreground'
                          : 'bg-destructive text-destructive-foreground'
                      }`}
                    >
                      {verdict.survived ? 'SURVIVED' : 'DIED'}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="card-content">
                <div className="verdict-details space-y-4">
                  <div className="strategy-section">
                    <h4 className="section-title font-medium text-sm text-muted-foreground mb-2">Strategy</h4>
                    <p className="strategy-text text-sm bg-muted p-3 rounded-lg">{submission}</p>
                  </div>
                  {verdict && (
                    <div className="ai-verdict-section">
                      <h4 className="section-title font-medium text-sm text-muted-foreground mb-2">AI Verdict</h4>
                      <p className="verdict-text text-sm leading-relaxed">{verdict.narrative}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="actions-section text-center">
        {isHost ? (
          <Button onClick={handleContinue} className="continue-button px-8 py-3">
            {roundNumber >= 3 ? 'View Leaderboard' : 'Next Round'}
          </Button>
        ) : (
          <p className="waiting-text text-muted-foreground text-lg">
            Waiting for host to continue...
          </p>
        )}
      </div>
    </div>
  );
};

export default MultiplayerVerdicts;