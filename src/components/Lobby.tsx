import { usePlayersList, useIsHost, useMultiplayerState } from 'playroomkit';
import { useState } from 'react';
import APIKeyModal from './APIKeyModal';
import type { GameState } from '../types/multiplayer';

interface LobbyProps {
  onStartGame: () => void;
}

const Lobby = ({ onStartGame }: LobbyProps) => {
  const players = usePlayersList(true);
  const isHost = useIsHost();
  const defaultGameState: GameState = {
    phase: 'lobby',
    currentRound: 1,
    scenario: '',
    timeLeft: 60,
    currentResultIndex: 0,
    hostApiKey: ''
  };
  const [gameState] = useMultiplayerState('gameState', defaultGameState);
  const [, setMultiplayerGameState] = useMultiplayerState('gameState', defaultGameState);
  const [showApiModal, setShowApiModal] = useState(false);

  const handleStartGame = () => {
    if (players.length < 2) return;
    if (isHost && !gameState?.hostApiKey) {
      setShowApiModal(true);
      return;
    }
    onStartGame();
  };

  const handleApiKeySubmit = (apiKey: string) => {
    setMultiplayerGameState({
      ...gameState,
      hostApiKey: apiKey
    });
    setShowApiModal(false);
    onStartGame();
  };

  return (
    <div className="text-center">
      <div className="bg-card border border-border p-6 rounded mb-6">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">Game Lobby</h2>
        
        <div className="mb-6">
          <h3 className="font-semibold mb-3 text-foreground">Players ({players.length}/8):</h3>
          <div className="space-y-2">
            {players.map((player) => (
              <div 
                key={player.id} 
                className={`p-2 rounded border ${
                  isHost && players[0]?.id === player.id ? 'border-primary bg-primary/10' : 'border-border bg-background'
                }`}
              >
                <span className="text-foreground">
                  {player.getProfile()?.name || 'Unknown Player'}
                  {isHost && players[0]?.id === player.id && ' (Host)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {isHost && (
          <div className="mb-4">
            <p className="text-muted-foreground mb-2">
              As host, you'll need to provide a Groq API key for the game.
            </p>
            <button
              onClick={handleStartGame}
              disabled={players.length < 2}
              className="bg-primary text-primary-foreground px-6 py-3 rounded hover:opacity-90 disabled:opacity-50"
            >
              {players.length < 2 
                ? 'Need at least 2 players' 
                : gameState?.hostApiKey 
                  ? 'Start Game' 
                  : 'Set API Key & Start'}
            </button>
          </div>
        )}

        {!isHost && (
          <p className="text-muted-foreground">Waiting for host to start the game...</p>
        )}
      </div>

      {showApiModal && (
        <APIKeyModal 
          onApiKeySubmit={handleApiKeySubmit}
          isVisible={true}
        />
      )}
    </div>
  );
};

export default Lobby;