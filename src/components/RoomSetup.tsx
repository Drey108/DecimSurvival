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
    <div className="text-center">
      <div className="bg-card border border-border p-6 rounded mb-4">
        <h2 className="text-xl font-bold mb-6 text-card-foreground">Multiplayer Setup</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-card-foreground">Your Name:</label>
            <Input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
              placeholder="Enter your name"
              className="w-full"
            />
            {!playerName.trim() && (
              <p className="text-sm text-destructive mt-1">Name is required</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onCreateRoom}
            disabled={!playerName.trim()}
            className="w-full"
            variant="default"
          >
            Create New Room
          </Button>
          
          <div className="text-muted-foreground">OR</div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-card-foreground">Room Code:</label>
            <Input
              type="text"
              value={joinRoomCode}
              onChange={handleJoinRoomCodeChange}
              placeholder="A1B2"
              className="w-full text-center font-mono text-lg"
              maxLength={4}
            />
            <Button
              onClick={handleJoinRoom}
              disabled={!playerName.trim() || joinRoomCode.length !== 4}
              className="w-full"
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