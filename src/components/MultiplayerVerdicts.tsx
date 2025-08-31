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
    scores: {},
    playerNames: {},
    leaderboard: [],
    roundEndTime: 0,
    playersDone: {},
    submissionTimes: {}
  });

  const handleContinue = () => {
    if (isHost) {
      onAdvanceToLeaderboard();
    }
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="glass-card p-8 rounded-3xl border-0">
          <div className="w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
            <span className="text-4xl">📊</span>
          </div>
          <h2 className="text-4xl font-orbitron font-black text-foreground mb-2">
            Round {roundNumber} Analysis
          </h2>
          <p className="text-xl text-muted-foreground mb-6">AI Survival Verdicts</p>
          
          {/* Scenario Recap */}
          <div className="bg-secondary/30 p-6 rounded-2xl">
            <h3 className="text-lg font-orbitron font-bold text-foreground mb-3">Mission Scenario:</h3>
            <p className="text-muted-foreground leading-relaxed">{scenario}</p>
          </div>
        </div>
      </div>

      {/* Verdicts Grid */}
      <div className="grid gap-6 mb-8">
        {players.map((player) => {
          const playerId = player.id;
          const playerName = player.getProfile()?.name || `Player ${playerId.slice(0, 4)}`;
          const submission = gameState.submissions?.[playerId] || 'No strategy submitted';
          const verdict = gameState.verdicts?.[playerId];
          const survived = verdict?.survived || false;
          const submissionTime = gameState.submissionTimes?.[playerId];
          const currentScore = gameState.scores?.[playerId] || 0;
          
          // Calculate submission time from round start
          const getSubmissionTimeDisplay = () => {
            if (submissionTime && gameState.roundEndTime) {
              const roundStartTime = gameState.roundEndTime - 60000;
              const timeFromStart = Math.floor((submissionTime - roundStartTime) / 1000);
              return `${timeFromStart}s`;
            }
            return 'No submission';
          };

          return (
            <div
              key={playerId}
              className={`glass-card p-6 rounded-2xl border-l-8 transition-all duration-500 card-hover ${
                survived
                  ? 'border-l-success bg-success/5'
                  : 'border-l-destructive bg-destructive/5'
              }`}
            >
              {/* Player Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    survived ? 'status-online' : 'bg-destructive animate-pulse'
                  }`}></div>
                  <h3 className="text-2xl font-orbitron font-bold text-foreground">
                    {playerName}
                  </h3>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* Submission Time */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-semibold">SUBMIT TIME</div>
                    <div className="text-sm font-orbitron font-bold text-primary">
                      {getSubmissionTimeDisplay()}
                    </div>
                  </div>
                  
                  {/* Score */}
                  <div className="text-center">
                    <div className="text-xs text-muted-foreground font-semibold">SCORE</div>
                    <div className="text-lg font-orbitron font-bold text-warning">
                      {currentScore}
                    </div>
                  </div>
                  
                  {/* Status */}
                  <div className={`px-6 py-3 rounded-2xl font-orbitron font-black text-lg ${
                    survived
                      ? 'bg-success/20 text-success border border-success/30'
                      : 'bg-destructive/20 text-destructive border border-destructive/30'
                  }`}>
                    {survived ? '✅ SURVIVED' : '💀 ELIMINATED'}
                  </div>
                </div>
              </div>

              {/* Strategy Section */}
              <div className="mb-6">
                <h4 className="text-sm font-orbitron font-bold text-foreground mb-3 flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  SURVIVAL STRATEGY
                </h4>
                <div className="bg-secondary/30 p-4 rounded-xl border border-border/30">
                  <p className="text-foreground leading-relaxed font-medium">
                    {submission || 'No strategy provided - automatic elimination'}
                  </p>
                </div>
              </div>

              {/* AI Verdict */}
              {verdict && (
                <div>
                  <h4 className="text-sm font-orbitron font-bold text-foreground mb-3 flex items-center">
                    <span className="w-2 h-2 bg-warning rounded-full mr-2 animate-pulse"></span>
                    AI ANALYSIS & VERDICT
                  </h4>
                  <div className={`p-5 rounded-xl border-2 ${
                    survived
                      ? 'bg-success/10 border-success/20'
                      : 'bg-destructive/10 border-destructive/20'
                  }`}>
                    <p className="text-foreground leading-relaxed font-medium">
                      {verdict.narrative}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Section */}
      <div className="text-center">
        <div className="glass-card p-6 rounded-2xl border-0 inline-block">
          {isHost ? (
            <Button 
              onClick={handleContinue} 
              className="btn-primary-glow px-8 py-4 text-lg font-semibold rounded-xl"
            >
              <span className="flex items-center space-x-2">
                <span>{roundNumber >= 3 ? '🏆' : '⚡'}</span>
                <span>
                  {roundNumber >= 3 ? 'View Final Results' : 'Next Mission'}
                </span>
              </span>
            </Button>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Awaiting Orders</h4>
              <p className="text-muted-foreground">
                Waiting for mission commander to proceed...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MultiplayerVerdicts;