import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoomSetupProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (roomCode: string) => void;
}

const RoomSetup = ({ playerName, setPlayerName, onCreateRoom, onJoinRoom }: RoomSetupProps) => {
  const [joinRoomCode, setJoinRoomCode] = useState('');

  const handleJoinRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    setJoinRoomCode(value);
  };

  const handleJoinRoom = () => {
    if (joinRoomCode.length === 4 && playerName.trim()) {
      onJoinRoom(joinRoomCode);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="glass-card card-hover rounded-3xl p-8 border-0">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎮</span>
          </div>
          <h2 className="text-3xl font-orbitron font-bold text-foreground mb-2">Join the Battle</h2>
          <p className="text-muted-foreground">Enter the arena of survival strategies</p>
        </div>
        
        {/* Player Name Input */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-foreground mb-3 flex items-center">
            <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
            Your Callsign
          </label>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            placeholder="Enter your name"
            className="glass-card bg-secondary/30 border-primary/20 text-foreground placeholder:text-muted-foreground h-12 text-lg font-medium focus:border-primary/50 focus:ring-primary/30"
          />
          {!playerName.trim() && (
            <p className="text-sm text-destructive mt-2 flex items-center">
              <span className="w-1 h-1 bg-destructive rounded-full mr-2"></span>
              Callsign required for identification
            </p>
          )}
        </div>

        <div className="space-y-6">
          {/* Create Room */}
          <Button
            onClick={onCreateRoom}
            disabled={!playerName.trim()}
            className="btn-primary-glow w-full h-14 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center space-x-2">
              <span>🚀</span>
              <span>Create New Mission</span>
            </span>
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/30"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-4 text-muted-foreground font-semibold tracking-wider">OR</span>
            </div>
          </div>
          
          {/* Join Room */}
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-foreground flex items-center">
              <span className="w-2 h-2 bg-success rounded-full mr-2"></span>
              Mission Code
            </label>
            <Input
              type="text"
              value={joinRoomCode}
              onChange={handleJoinRoomCodeChange}
              placeholder="A1B2"
              className="glass-card bg-secondary/30 border-success/20 text-center font-mono text-2xl font-bold h-16 tracking-[0.5em] focus:border-success/50 focus:ring-success/30"
              maxLength={4}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || joinRoomCode.length !== 4}
              variant="outline"
              className="w-full h-12 text-base font-semibold rounded-xl border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 disabled:opacity-50"
            >
              <span className="flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>Join Mission</span>
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSetup;