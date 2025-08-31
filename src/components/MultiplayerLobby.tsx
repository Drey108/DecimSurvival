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
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="glass-card rounded-3xl p-8 border-0">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-success/20 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
            <span className="text-3xl">🏁</span>
          </div>
          <h2 className="text-3xl font-orbitron font-bold text-foreground mb-2">Mission Control</h2>
          <div className="bg-primary/10 px-6 py-3 rounded-2xl inline-block mb-4">
            <span className="font-mono text-2xl font-bold text-primary">
              {roomCode}
            </span>
          </div>
          <p className="text-muted-foreground">Preparing for survival simulation</p>
        </div>
        
        {/* Players Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-orbitron font-bold text-foreground">
              Squad Members
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm text-success font-semibold">
                {players.length}/4 Connected
              </span>
            </div>
          </div>
          
          <div className="grid gap-3">
            {players.map((player, index) => {
              const isCurrentPlayer = player.id === myPlayer()?.id;
              const isHostPlayer = index === 0;
              return (
                <div
                  key={player.id}
                  className={`glass-card p-4 rounded-xl border-l-4 transition-all duration-300 ${
                    isCurrentPlayer 
                      ? 'border-l-primary bg-primary/5' 
                      : isHostPlayer 
                      ? 'border-l-warning bg-warning/5' 
                      : 'border-l-muted bg-muted/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        isCurrentPlayer ? 'status-online' : 'status-waiting'
                      }`}></div>
                      <span className="font-medium text-foreground">
                        {player.getProfile()?.name || `Player ${player.id.slice(0, 4)}`}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isCurrentPlayer && (
                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full">
                          YOU
                        </span>
                      )}
                      {isHostPlayer && (
                        <span className="px-2 py-1 bg-warning/20 text-warning text-xs font-semibold rounded-full">
                          HOST
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="mb-8">
            <div className="glass-card p-6 rounded-2xl border border-primary/20">
              <h4 className="text-lg font-orbitron font-bold text-foreground mb-4 flex items-center">
                <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                Host Configuration
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2 flex items-center">
                    <span className="w-1.5 h-1.5 bg-warning rounded-full mr-2"></span>
                    Groq API Key (Required for AI Analysis)
                  </label>
                  <Input
                    type="password"
                    value={hostApiKey}
                    onChange={(e) => setHostApiKey(e.target.value)}
                    placeholder="Enter your Groq API key"
                    className="glass-card bg-secondary/30 border-warning/20 text-foreground placeholder:text-muted-foreground h-12 font-mono focus:border-warning/50 focus:ring-warning/30"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Required to analyze survival strategies with AI
                  </p>
                </div>
                
                <Button
                  onClick={handleStartGame}
                  disabled={!hostApiKey.trim()}
                  className="btn-primary-glow w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50"
                >
                  <span className="flex items-center justify-center space-x-2">
                    <span>🎯</span>
                    <span>Launch Mission</span>
                  </span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Non-Host Waiting */}
        {!isHost && (
          <div className="mb-8">
            <div className="glass-card p-6 rounded-2xl text-center">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-2 border-muted border-t-primary rounded-full animate-spin"></div>
              </div>
              <h4 className="text-lg font-semibold text-foreground mb-2">Standing By</h4>
              <p className="text-muted-foreground">
                Waiting for mission commander to initiate survival simulation...
              </p>
            </div>
          </div>
        )}

        {/* Leave Room Button */}
        <div className="flex justify-center">
          <Button
            onClick={onLeaveRoom}
            variant="ghost"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 px-6 py-2 rounded-xl"
          >
            <span className="flex items-center space-x-2">
              <span>⬅️</span>
              <span>Leave Mission</span>
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MultiplayerLobby;