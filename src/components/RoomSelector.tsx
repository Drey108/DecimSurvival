import { useState } from 'react';
import { insertCoin } from 'playroomkit';

interface RoomSelectorProps {
  onRoomJoined: () => void;
}

const RoomSelector = ({ onRoomJoined }: RoomSelectorProps) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    if (!playerName.trim()) return;
    
    setIsJoining(true);
    try {
      const newRoomId = generateRoomId();
      await insertCoin({
        roomCode: newRoomId,
      });
      // Set player name after joining
      const myPlayer = (window as any).Playroom?.myPlayer?.();
      if (myPlayer) {
        myPlayer.setState('name', playerName.trim());
      }
      onRoomJoined();
    } catch (error) {
      console.error('Error creating room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const joinRoom = async () => {
    if (!playerName.trim() || !roomId.trim()) return;
    
    setIsJoining(true);
    try {
      await insertCoin({
        roomCode: roomId.trim().toUpperCase(),
      });
      // Set player name after joining
      const myPlayer = (window as any).Playroom?.myPlayer?.();
      if (myPlayer) {
        myPlayer.setState('name', playerName.trim());
      }
      onRoomJoined();
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded">
      <h2 className="text-xl font-bold mb-4 text-card-foreground">Join or Create Room</h2>
      
      <div className="mb-4">
        <label className="block font-semibold mb-2 text-foreground">
          Your Name:
        </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="w-full p-3 border border-border rounded bg-input text-foreground"
          disabled={isJoining}
        />
      </div>

      <div className="space-y-4">
        <button
          onClick={createRoom}
          disabled={!playerName.trim() || isJoining}
          className="w-full bg-primary text-primary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isJoining ? 'Creating...' : 'Create New Room'}
        </button>

        <div className="text-center text-muted-foreground">or</div>

        <div>
          <label className="block font-semibold mb-2 text-foreground">
            Room ID:
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            placeholder="Enter room ID"
            className="w-full p-3 border border-border rounded bg-input text-foreground mb-2"
            disabled={isJoining}
          />
          <button
            onClick={joinRoom}
            disabled={!playerName.trim() || !roomId.trim() || isJoining}
            className="w-full bg-secondary text-secondary-foreground p-3 rounded hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isJoining ? 'Joining...' : 'Join Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;