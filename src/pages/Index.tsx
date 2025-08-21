import { useState } from 'react';
import { insertCoin, useMultiplayerState, useIsHost, myPlayer } from 'playroomkit';
import APIKeyModal from '../components/APIKeyModal';
import GameScreen from '../components/GameScreen';
import ResultDisplay from '../components/ResultDisplay';
import ModeSelector from '../components/ModeSelector';
import RoomSetup from '../components/RoomSetup';
import MultiplayerLobby from '../components/MultiplayerLobby';
import { useGroqAPI } from '../hooks/useGroqAPI';

type GameMode = 'menu' | 'single' | 'multi-setup' | 'lobby';
type GameState = 'setup' | 'playing' | 'result' | 'finished';

const scenarios = [
  "Zombie outbreak in shopping mall. You're trapped with limited supplies. Survive 24 hours.",
  "Plane crashed on deserted island. You have only clothes on your back. What's your plan?", 
  "Nuclear war started. 10 minutes before fallout hits your area. How do you survive?",
  "Stuck in blizzard in your car on empty highway. No cell service. Temperature dropping.",
  "Building fire on 15th floor. Elevators down, stairs blocked by smoke. How do you escape?"
];

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [gameState, setGameState] = useState<GameState>('setup');
  const [apiKey, setApiKey] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [score, setScore] = useState(0);
  const [currentScenario, setCurrentScenario] = useState('');
  const [lastResult, setLastResult] = useState({ narrative: '', survived: false });
  const [error, setError] = useState('');
  
  // Multiplayer state
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  
  // Initialize multiplayer state with error handling
  let multiplayerState, setMultiplayerState, isHost;
  try {
    [multiplayerState, setMultiplayerState] = useMultiplayerState('game', {
      phase: 'lobby',
      currentRound: 1,
      scenario: '',
      hostApiKey: ''
    });
    isHost = useIsHost();
  } catch (e) {
    // Fallback to default values if multiplayer fails
    multiplayerState = { phase: 'lobby', currentRound: 1, scenario: '', hostApiKey: '' };
    setMultiplayerState = () => {};
    isHost = false;
  }

  const { analyzeStrategy, isLoading } = useGroqAPI(apiKey);

  // Mode selection handlers
  const handleModeSelect = (mode: 'single' | 'multiplayer') => {
    if (mode === 'single') {
      setGameMode('single');
      setGameState('setup');
    } else {
      setGameMode('multi-setup');
    }
  };

  const handleBackToModeSelect = () => {
    setGameMode('menu');
    setGameState('setup');
    setPlayerName('');
    setRoomCode('');
  };

  // Room handlers
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Name is required');
      return;
    }
    
    const newRoomCode = generateRoomCode();
    setRoomCode(newRoomCode);
    
    try {
      await insertCoin({
        roomCode: newRoomCode,
        skipLobby: true
      });
      
      // Set player profile name
      const me = myPlayer();
      if (me) {
        me.setState('profile', { name: playerName.trim() });
      }
      
      setMultiplayerState({
        phase: 'lobby',
        currentRound: 1,
        scenario: '',
        hostApiKey: ''
      });
      setGameMode('lobby');
    } catch (error) {
      setError('Failed to create room');
    }
  };

  const handleJoinRoom = async (code: string) => {
    if (!playerName.trim()) {
      setError('Name is required');
      return;
    }
    
    setRoomCode(code);
    
    try {
      await insertCoin({
        roomCode: code,
        skipLobby: true
      });
      
      // Set player profile name
      const me = myPlayer();
      if (me) {
        me.setState('profile', { name: playerName.trim() });
      }
      
      setGameMode('lobby');
    } catch (error) {
      setError('Failed to join room');
    }
  };

  const handleLeaveRoom = () => {
    setGameMode('multi-setup');
    setRoomCode('');
  };

  const handleMultiplayerStartGame = (hostApiKey: string) => {
    setApiKey(hostApiKey);
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentScenario(randomScenario);
    setMultiplayerState({
      ...multiplayerState,
      hostApiKey,
      phase: 'game',
      scenario: randomScenario
    });
    setGameMode('single'); // Reuse single player game screen
    setGameState('playing');
  };

  // Single player handlers
  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    setGameState('setup');
  };

  const startGame = () => {
    setCurrentRound(1);
    setScore(0);
    setError('');
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setCurrentScenario(randomScenario);
    setGameState('playing');
  };

  const handleStrategySubmit = async (strategy: string) => {
    try {
      setError('');
      const result = await analyzeStrategy(currentScenario, strategy);
      setLastResult(result);
      
      if (result.survived) {
        setScore(prev => prev + 1);
      }
      
      setGameState('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze strategy');
    }
  };

  const handleContinue = () => {
    if (currentRound >= 3) {
      setGameState('finished');
    } else {
      setCurrentRound(prev => prev + 1);
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      setCurrentScenario(randomScenario);
      setGameState('playing');
    }
  };

  const resetGame = () => {
    if (gameMode === 'single') {
      setGameState('setup');
    } else {
      setGameMode('menu');
    }
    setCurrentRound(1);
    setScore(0);
    setError('');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">DECIM</h1>
          <p className="text-muted-foreground">Survival Game</p>
        </header>

        {gameMode === 'menu' && (
          <ModeSelector onSelectMode={handleModeSelect} />
        )}

        {gameMode === 'multi-setup' && (
          <RoomSetup
            playerName={playerName}
            setPlayerName={setPlayerName}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onBack={handleBackToModeSelect}
          />
        )}

        {gameMode === 'lobby' && (
          <MultiplayerLobby
            roomCode={roomCode}
            onStartGame={handleMultiplayerStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {gameMode === 'single' && gameState === 'setup' && !apiKey && (
          <>
            <APIKeyModal 
              onApiKeySubmit={handleApiKeySubmit}
              isVisible={true}
            />
          </>
        )}

        {gameMode === 'single' && gameState === 'setup' && apiKey && (
          <div className="text-center">
            <div className="bg-card border border-border p-6 rounded mb-4">
              <h2 className="text-xl font-bold mb-4 text-card-foreground">Ready to Play</h2>
              <p className="text-muted-foreground mb-4">
                You will face 3 random survival scenarios. Each round you have 60 seconds to devise a strategy.
                The AI will analyze your approach and determine if you survive or perish.
              </p>
              <p className="text-muted-foreground mb-4">
                <strong>Scoring:</strong> 1 point per survival, 0 for death
              </p>
            </div>
            <button
              onClick={startGame}
              className="bg-primary text-primary-foreground px-8 py-3 rounded text-lg hover:opacity-90"
            >
              Start Game
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <GameScreen
            scenario={currentScenario}
            roundNumber={currentRound}
            onStrategySubmit={handleStrategySubmit}
            isLoading={isLoading}
          />
        )}

        {gameState === 'result' && (
          <ResultDisplay
            narrative={lastResult.narrative}
            survived={lastResult.survived}
            onContinue={handleContinue}
            roundNumber={currentRound}
          />
        )}

        {gameState === 'finished' && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Final Score</h2>
            <div className="bg-card border border-border p-6 rounded mb-4">
              <div className="text-4xl font-bold mb-2 text-card-foreground">{score}/3</div>
              <p className="text-muted-foreground">
                {score === 3 && "Perfect! You're a survival master!"}
                {score === 2 && "Great job! You survived most scenarios."}
                {score === 1 && "Not bad, but room for improvement."}
                {score === 0 && "Better luck next time, survival isn't easy!"}
              </p>
            </div>
            <button
              onClick={resetGame}
              className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90"
            >
              Play Again
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-destructive text-destructive-foreground rounded">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
