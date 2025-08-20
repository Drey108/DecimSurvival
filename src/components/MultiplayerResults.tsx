import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface PlayerResult {
  playerId: string;
  playerName: string;
  strategy: string;
  narrative: string;
  survived: boolean;
  timeUp: boolean;
}

interface MultiplayerResultsProps {
  playerResults: PlayerResult[];
  onNextRound: () => void;
  onFinishGame: () => void;
  roundNumber: number;
  isHost: boolean;
}

const MultiplayerResults = ({ 
  playerResults, 
  onNextRound, 
  onFinishGame, 
  roundNumber, 
  isHost 
}: MultiplayerResultsProps) => {
  const [showAll, setShowAll] = useState(false);

  const survivorCount = playerResults.filter(result => result.survived).length;
  const totalPlayers = playerResults.length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          Round {roundNumber} Results
        </h2>
        <div className="bg-card border border-border p-4 rounded mb-4">
          <div className="text-lg font-semibold text-card-foreground">
            {survivorCount}/{totalPlayers} Players Survived
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {playerResults.map((result, index) => (
          <div
            key={result.playerId}
            className={`border border-border p-4 rounded bg-card ${
              result.survived ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-card-foreground">
                {result.playerName}
              </h3>
              <span
                className={`text-sm font-bold ${
                  result.survived ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {result.survived ? '✅ SURVIVED' : '💀 DIED'}
              </span>
            </div>

            {showAll && (
              <>
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Strategy:</h4>
                  <p className="text-sm text-card-foreground bg-muted p-2 rounded">
                    {result.timeUp ? "⏰ Time ran out - no strategy submitted" : result.strategy}
                  </p>
                </div>

                <div className="mb-2">
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Outcome:</h4>
                  <p className="text-sm text-card-foreground">{result.narrative}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="text-center space-y-3">
        <Button
          variant="outline"
          onClick={() => setShowAll(!showAll)}
          className="w-full"
        >
          {showAll ? 'Hide Details' : 'Show All Strategies & Outcomes'}
        </Button>

        {isHost && (
          <div className="space-y-2">
            {roundNumber < 3 ? (
              <Button onClick={onNextRound} className="w-full">
                Next Round
              </Button>
            ) : (
              <Button onClick={onFinishGame} className="w-full">
                View Final Results
              </Button>
            )}
            <p className="text-sm text-muted-foreground">
              {isHost ? 'As host, you control game progression' : 'Waiting for host...'}
            </p>
          </div>
        )}

        {!isHost && (
          <div className="text-center">
            <p className="text-muted-foreground">
              Waiting for host to continue...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiplayerResults;