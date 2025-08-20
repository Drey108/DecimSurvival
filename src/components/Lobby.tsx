import { useState } from 'react';
import { usePlayersList, useIsHost, useMultiplayerState } from 'playroomkit';

interface LobbyProps {
  roomId: string;
  onGameStart: (apiKey: string) => void;
}

const Lobby = ({ roomId, onGameStart }: LobbyProps) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiInput, setShowApiInput] = useState(false);
  
  const players = usePlayersList(true);
  const isHost = useIsHost();
  const [gameState] = useMultiplayerState('gameState', {
    phase: 'lobby',
    currentRound: 1,
    currentScenario: '',
    hostApiKey: ''
  });

  const handleStartGame = () => {
    if (!apiKey.trim()) {
      setShowApiInput(true);
      return;
    }
    onGameStart(apiKey.trim());
  };

  const canStartGame = isHost && players.length >= 2;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Room: {roomId}</h2>
        <p className="text-muted-foreground">
          {players.length}/8 players connected
        </p>
      </div>

      <div className="bg-card border border-border p-6 rounded">
        <h3 className="text-lg font-bold mb-4 text-card-foreground">Players in Room</h3>
        <div className="space-y-2">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 bg-secondary rounded"
            >
              <span className="text-secondary-foreground">
                {player.getState('name') || 'Anonymous'}
              </span>
              {player.id === players[0]?.id && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  HOST
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {isHost ? (
        <div className="text-center">
          {canStartGame ? (
            <div className="space-y-4">
              {showApiInput && (
                <div className="bg-card border border-border p-4 rounded">
                  <label className="block font-semibold mb-2 text-card-foreground">
                    Groq API Key (required to start):
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your Groq API key"
                    className="w-full p-3 border border-border rounded bg-input text-foreground mb-3"
                  />
                </div>
              )}
              
              <button
                onClick={handleStartGame}
                className="bg-primary text-primary-foreground px-8 py-3 rounded text-lg hover:opacity-90"
                disabled={showApiInput && !apiKey.trim()}
              >
                {showApiInput ? 'Start Game' : 'Start Game (Need API Key)'}
              </button>
            </div>
          ) : (
            <div className="text-muted-foreground">
              Need at least 2 players to start the game
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          Waiting for host to start the game...
        </div>
      )}

      <div className="bg-card border border-border p-4 rounded">
        <h4 className="font-bold mb-2 text-card-foreground">Game Rules:</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 3 rounds of survival scenarios</li>
          <li>• 60 seconds to write your strategy each round</li>
          <li>• AI analyzes and determines if you survive</li>
          <li>• 1 point per survival, 0 for death</li>
        </ul>
      </div>
    </div>
  );
};

export default Lobby;