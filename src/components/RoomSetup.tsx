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
    <div className="setup-screen text-center">
      <div className="setup-card bg-card border border-border p-8 rounded-lg">
        <h2 className="card-title text-2xl font-bold mb-8 text-primary">Join the Game</h2>
        
        <div className="name-section mb-8">
          <label className="field-label block text-sm font-medium mb-3 text-card-foreground">Your Name</label>
          <Input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
            placeholder="Enter your name"
            className="name-input w-full text-center"
          />
          {!playerName.trim() && (
            <p className="error-text text-sm text-destructive mt-2">Name is required</p>
          )}
        </div>

        <div className="actions-section space-y-6">
          <Button
            onClick={onCreateRoom}
            disabled={!playerName.trim()}
            className="create-button w-full py-3"
            variant="default"
          >
            Create New Room
          </Button>
          
          <div className="divider text-muted-foreground font-light">OR</div>
          
          <div className="join-section space-y-3">
            <label className="field-label block text-sm font-medium text-card-foreground">Room Code</label>
            <Input
              type="text"
              value={joinRoomCode}
              onChange={handleJoinRoomCodeChange}
              placeholder="A1B2"
              className="room-input w-full text-center font-mono text-xl tracking-widest"
              maxLength={4}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || joinRoomCode.length !== 4}
              className="join-button w-full py-3"
              variant="outline"
            >
              Join Room
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSetup;