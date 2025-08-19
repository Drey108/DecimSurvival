import { useState } from 'react';
import { insertCoin } from 'playroomkit';

interface RoomJoinProps {
  onJoinRoom: () => void;
}

const RoomJoin = ({ onJoinRoom }: RoomJoinProps) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleJoinRoom = async () => {
    if (!playerName.trim()) return;

    try {
      await insertCoin({
        roomCode: roomId || undefined,
        gameId: 'decim-survival',
        skipLobby: false,
      });
      onJoinRoom();
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    setIsCreating(true);
    
    try {
      await insertCoin({
        gameId: 'decim-survival',
        skipLobby: false,
      });
      onJoinRoom();
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="text-center">
      <div className="bg-card border border-border p-6 rounded mb-6">
        <h2 className="text-xl font-bold mb-4 text-card-foreground">Join Multiplayer Game</h2>
        
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
            maxLength={20}
          />
        </div>

        <div className="mb-6">
          <label className="block font-semibold mb-2 text-foreground">
            Room ID (optional):
          </label>
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Leave empty to create new room"
            className="w-full p-3 border border-border rounded bg-input text-foreground"
          />
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handleJoinRoom}
            disabled={!playerName.trim()}
            className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90 disabled:opacity-50"
          >
            {roomId ? 'Join Room' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomJoin;