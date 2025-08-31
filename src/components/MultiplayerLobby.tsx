import { useState, useEffect } from 'react';
import { usePlayersList, useIsHost, useMultiplayerState, myPlayer } from 'playroomkit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MultiplayerLobbyProps {
  roomCode: string;
  onStartGame: (apiKey: string) => void;
  onLeaveRoom: () => void;
}

const MultiplayerLobby = ({ roomCode, onStartGame, onLeaveRoom }: MultiplayerLobbyProps) => {
  const [hostApiKey, setHostApiKey] = useState('');
  const players = usePlayersList(true);
  const isHost = useIsHost();
  const [gameState, setGameState] = useMultiplayerState('game', {
    phase: 'lobby',
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    playerNames: {}
  });

  // Auto-start game for all players when host starts
  useEffect(() => {
    if (gameState.phase === 'game' && gameState.hostApiKey) {
      onStartGame(gameState.hostApiKey);
    }
  }, [gameState.phase, gameState.hostApiKey, onStartGame]);

  const handleStartGame = () => {
    if (hostApiKey.trim() && players.length >= 1) {
      setGameState({
        ...gameState,
        hostApiKey,
        phase: 'game'
      });
    }
  };

  return (
    <div className="text-center">
      <div className="bg-card border border-border p-6 rounded mb-4">
        <h2 className="text-xl font-bold mb-2 text-card-foreground">Room Lobby</h2>
        <div className="text-lg font-mono mb-6 text-primary">Room Code: {roomCode}</div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-card-foreground">
            Players ({players.length}/4)
          </h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <span className="text-card-foreground">
                  {gameState.playerNames?.[player.id] || player.getProfile()?.name || `Player ${player.id.slice(0, 4)}`}
                </span>
                {player.id === myPlayer()?.id && (
                  <span className="text-xs text-muted-foreground">(You)</span>
                )}
                {players.findIndex(p => p.id === player.id) === 0 && (
                  <span className="text-xs text-primary font-medium">(Host)</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-card-foreground">
              Groq API Key (Required):
            </label>
            <Input
              type="password"
              value={hostApiKey}
              onChange={(e) => setHostApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
              className="w-full mb-3"
            />
            <Button
              onClick={handleStartGame}
              disabled={!hostApiKey.trim()}
              className="w-full"
              variant="default"
            >
              Start Game
            </Button>
          </div>
        )}

        {!isHost && (
          <div className="mb-6">
            <p className="text-muted-foreground">
              Waiting for host to start the game...
            </p>
          </div>
        )}
      </div>
      
      <Button
        onClick={onLeaveRoom}
        variant="ghost"
      >
        Leave Room
      </Button>
    </div>
  );
};

export default MultiplayerLobby;