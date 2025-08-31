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
    hostApiKey: ''
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
    <div className="lobby-screen text-center">
      <div className="lobby-card bg-card border border-border p-8 rounded-lg">
        <h2 className="card-title text-2xl font-bold mb-4 text-primary">Game Lobby</h2>
        <div className="room-code text-xl font-mono mb-8 text-primary bg-primary/10 py-2 px-4 rounded">
          Room: {roomCode}
        </div>
        
        <div className="players-section mb-8">
          <h3 className="section-title text-lg font-semibold mb-4 text-card-foreground">
            Players ({players.length}/4)
          </h3>
          <div className="players-list space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="player-card flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <span className="player-name text-card-foreground font-medium">
                  {player.getProfile()?.name || `Player ${player.id.slice(0, 4)}`}
                </span>
                <div className="player-badges flex gap-2">
                  {player.id === myPlayer()?.id && (
                    <span className="badge text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded">You</span>
                  )}
                  {players.findIndex(p => p.id === player.id) === 0 && (
                    <span className="badge text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Host</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="host-section mb-8">
            <label className="field-label block text-sm font-medium mb-3 text-card-foreground">
              Groq API Key (Required)
            </label>
            <Input
              type="password"
              value={hostApiKey}
              onChange={(e) => setHostApiKey(e.target.value)}
              placeholder="Enter your Groq API key"
              className="api-input w-full mb-4"
            />
            <Button
              onClick={handleStartGame}
              disabled={!hostApiKey.trim()}
              className="start-button w-full py-3"
              variant="default"
            >
              Start Game
            </Button>
          </div>
        )}

        {!isHost && (
          <div className="waiting-section mb-8">
            <p className="waiting-text text-muted-foreground text-lg">
              Waiting for host to start the game...
            </p>
          </div>
        )}
      </div>
      
      <Button
        onClick={onLeaveRoom}
        className="leave-button mt-4"
        variant="ghost"
      >
        Leave Room
      </Button>
    </div>
  );
};

export default MultiplayerLobby;