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
    <div className="setup-screen min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-card/50">
      <div className="setup-container max-w-md w-full mx-4">
        {/* Hero Section */}
        <div className="hero-section text-center mb-8">
          <div className="logo-container mb-6">
            <div className="logo-icon w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
              <div className="logo-text text-3xl font-bold text-primary-foreground">D</div>
            </div>
            <h1 className="game-title text-4xl font-bold text-primary mb-2 font-papyrus">Decim</h1>
            <p className="game-subtitle text-muted-foreground">Test your survival instincts</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="setup-card bg-card/80 backdrop-blur border border-border/50 p-8 rounded-2xl shadow-2xl">
          <div className="card-content space-y-6">
            {/* Name Input */}
            <div className="name-section">
              <label className="field-label block text-sm font-medium mb-3 text-card-foreground">
                Choose your name
              </label>
              <Input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
                placeholder="Enter your name"
                className="name-input w-full text-center py-3 text-lg bg-input/50 border-border/50 rounded-xl"
              />
              {!playerName.trim() && (
                <p className="error-text text-sm text-destructive mt-2 text-center">Name required</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="actions-section space-y-4">
              <Button
                onClick={onCreateRoom}
                disabled={!playerName.trim()}
                className="create-button w-full py-4 text-lg rounded-xl bg-primary shadow-lg"
                variant="default"
              >
                Create New Game
              </Button>
              
              <div className="divider-section flex items-center">
                <div className="divider-line flex-1 h-px bg-border"></div>
                <span className="divider-text px-4 text-sm text-muted-foreground">or</span>
                <div className="divider-line flex-1 h-px bg-border"></div>
              </div>
              
              <div className="join-section space-y-3">
                <label className="field-label block text-sm font-medium text-card-foreground text-center">
                  Join existing game
                </label>
                <Input
                  type="text"
                  value={joinRoomCode}
                  onChange={handleJoinRoomCodeChange}
                  placeholder="Room Code"
                  className="room-input w-full text-center font-mono text-2xl tracking-[0.5em] py-3 bg-input/50 border-border/50 rounded-xl"
                  maxLength={4}
                />
                <Button
                  onClick={handleJoinRoom}
                  disabled={!playerName.trim() || joinRoomCode.length !== 4}
                  className="join-button w-full py-4 text-lg rounded-xl"
                  variant="outline"
                >
                  Join Game
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="footer-section text-center mt-8">
          <p className="footer-text text-sm text-muted-foreground">
            Multiplayer survival strategy game
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoomSetup;