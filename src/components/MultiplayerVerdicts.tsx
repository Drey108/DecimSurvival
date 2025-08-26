import { usePlayersList, useIsHost } from 'playroomkit';

interface MultiplayerVerdictsProps {
  scenario: string;
  roundNumber: number;
  submissions: Record<string, string>;
  verdicts: Record<string, { survived: boolean; narrative: string; score: number }>;
  onShowLeaderboard: () => void;
}

const MultiplayerVerdicts = ({ 
  scenario, 
  roundNumber, 
  submissions, 
  verdicts, 
  onShowLeaderboard 
}: MultiplayerVerdictsProps) => {
  const players = usePlayersList();
  const isHost = useIsHost();

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-center text-foreground">
        Round {roundNumber} Results
      </h2>
      
      <div className="bg-card border border-border p-4 rounded mb-6">
        <h3 className="font-semibold mb-2 text-card-foreground">Scenario:</h3>
        <p className="text-card-foreground">{scenario}</p>
      </div>

      <div className="space-y-4 mb-6">
        {players.map((player) => {
          const playerName = player.getProfile()?.name || `Player ${player.id.slice(0, 6)}`;
          const submission = submissions[player.id];
          const verdict = verdicts[player.id];
          
          if (!submission || !verdict) return null;

          return (
            <div key={player.id} className="bg-card border border-border p-4 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-card-foreground">{playerName}</h4>
                <span className={`font-bold ${verdict.survived ? 'text-success' : 'text-destructive'}`}>
                  {verdict.survived ? 'SURVIVED' : 'DIED'}
                </span>
              </div>
              
              <div className="mb-2">
                <strong className="text-card-foreground">Strategy:</strong>
                <p className="text-muted-foreground text-sm">{submission}</p>
              </div>
              
              <div>
                <strong className="text-card-foreground">Result:</strong>
                <p className="text-muted-foreground text-sm">{verdict.narrative}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isHost && (
        <div className="text-center">
          <button
            onClick={onShowLeaderboard}
            className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90"
          >
            Show Leaderboard
          </button>
        </div>
      )}
      
      {!isHost && (
        <div className="text-center text-muted-foreground">
          Waiting for host to show leaderboard...
        </div>
      )}
    </div>
  );
};

export default MultiplayerVerdicts;