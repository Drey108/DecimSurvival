import { useState, useEffect } from 'react';
import { insertCoin, useMultiplayerState, useIsHost, myPlayer, usePlayersList } from 'playroomkit';
import APIKeyModal from '../components/APIKeyModal';
import GameScreen from '../components/GameScreen';
import ResultDisplay from '../components/ResultDisplay';
import ModeSelector from '../components/ModeSelector';
import RoomSetup from '../components/RoomSetup';
import MultiplayerLobby from '../components/MultiplayerLobby';
import MultiplayerGameScreen from '../components/MultiplayerGameScreen';
import MultiplayerVerdicts from '../components/MultiplayerVerdicts';
import MultiplayerLeaderboard from '../components/MultiplayerLeaderboard';
import { useGroqAPI } from '../hooks/useGroqAPI';

type GameMode = 'menu' | 'single' | 'multi-setup' | 'lobby' | 'multiplayer';
type GameState = 'setup' | 'playing' | 'result' | 'finished';
type MultiplayerPhase = 'lobby' | 'collectingSubmissions' | 'evaluating' | 'showingVerdicts' | 'showingLeaderboard';

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
  let multiplayerState, setMultiplayerState, isHost, players;
  try {
    [multiplayerState, setMultiplayerState] = useMultiplayerState('game', {
      phase: 'lobby' as MultiplayerPhase,
      currentRound: 1,
      scenario: '',
      hostApiKey: '',
      submissions: {},
      verdicts: {},
      scores: {},
      playerNames: {},
      leaderboard: []
    });
    isHost = useIsHost();
    players = usePlayersList(true);
  } catch (e) {
    // Fallback to default values if multiplayer fails
    multiplayerState = { 
      phase: 'lobby' as MultiplayerPhase, 
      currentRound: 1, 
      scenario: '', 
      hostApiKey: '',
      submissions: {},
      verdicts: {},
      scores: {},
      playerNames: {},
      leaderboard: []
    };
    setMultiplayerState = () => {};
    isHost = false;
    players = [];
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
      
      // Store player name in global state
      const playerId = me?.id;
      setMultiplayerState({
        phase: 'lobby',
        currentRound: 1,
        scenario: '',
        hostApiKey: '',
        playerNames: playerId ? { [playerId]: playerName.trim() } : {},
        scores: {},
        submissions: {},
        verdicts: {},
        leaderboard: []
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
      
      // Add player name to global state
      const playerId = me?.id;
      if (playerId) {
        setMultiplayerState({
          ...multiplayerState,
          playerNames: {
            ...multiplayerState.playerNames,
            [playerId]: playerName.trim()
          }
        });
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
    const scenario = scenarios[multiplayerState.currentRound - 1] || scenarios[0];
    setCurrentScenario(scenario);
    const roundEndTime = Date.now() + 60000; // 60 seconds from now
    setMultiplayerState({
      ...multiplayerState,
      hostApiKey,
      phase: 'collectingSubmissions',
      scenario,
      roundEndTime,
      playersDone: {}
    });
    setGameMode('multiplayer');
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

  // Multiplayer handlers
  const handleAdvanceToVerdicts = async () => {
    if (!isHost) return;
    
    try {
      setMultiplayerState({
        ...multiplayerState,
        phase: 'evaluating'
      });

      // Get all submissions and analyze them
      const verdicts: { [playerId: string]: { narrative: string; survived: boolean } } = {};
      const scores = { ...multiplayerState.scores };

      for (const [playerId, strategy] of Object.entries(multiplayerState.submissions || {})) {
        try {
          const result = await analyzeStrategy(multiplayerState.scenario, strategy as string);
          verdicts[playerId] = result;
          
          // Update scores
          if (result.survived) {
            scores[playerId] = (scores[playerId] || 0) + 1;
          }
        } catch (error) {
          verdicts[playerId] = {
            narrative: 'Failed to analyze strategy.',
            survived: false
          };
        }
      }

      setMultiplayerState({
        ...multiplayerState,
        phase: 'showingVerdicts',
        verdicts,
        scores
      });
    } catch (error) {
      setError('Failed to analyze strategies');
    }
  };

  const handleAdvanceToLeaderboard = () => {
    if (!isHost) return;
    
    // Only show leaderboard after 3 rounds, otherwise advance to next round
    if (multiplayerState.currentRound >= 3) {
      // Calculate and store final leaderboard
      const leaderboard = Object.keys(multiplayerState.scores || {})
        .map(playerId => ({
          playerId,
          name: multiplayerState.playerNames?.[playerId] || `Player ${playerId.slice(0, 4)}`,
          score: multiplayerState.scores?.[playerId] || 0
        }))
        .sort((a, b) => b.score - a.score);

      setMultiplayerState({
        ...multiplayerState,
        phase: 'showingLeaderboard',
        leaderboard
      });
    } else {
      // Auto-advance to next round
      handleNextRound();
    }
  };

  const handleNextRound = () => {
    if (!isHost) return;
    
    const nextRound = multiplayerState.currentRound + 1;
    const scenario = scenarios[nextRound - 1];
    
    if (scenario && nextRound <= 3) {
      const roundEndTime = Date.now() + 60000; // 60 seconds from now
      setCurrentScenario(scenario);
      setMultiplayerState({
        ...multiplayerState,
        phase: 'collectingSubmissions',
        currentRound: nextRound,
        scenario,
        roundEndTime,
        submissions: {},
        verdicts: {},
        playersDone: {}
      });
    }
  };

  const handleEndGame = () => {
    if (!isHost) return;
    
    setGameMode('menu');
    setMultiplayerState({
      phase: 'lobby',
      currentRound: 1,
      scenario: '',
      hostApiKey: '',
      submissions: {},
      verdicts: {},
      scores: {},
      playerNames: {},
      leaderboard: []
    });
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
        <header className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <span className="font-papyrus">Decim</span>
          </h1>
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

        {gameMode === 'multiplayer' && multiplayerState.phase === 'collectingSubmissions' && (
          <MultiplayerGameScreen
            scenario={multiplayerState.scenario}
            roundNumber={multiplayerState.currentRound}
            onAdvanceToVerdicts={handleAdvanceToVerdicts}
          />
        )}

        {gameMode === 'multiplayer' && multiplayerState.phase === 'evaluating' && (
          <div className="text-center">
            <div className="text-xl mb-4">AI is analyzing all strategies...</div>
            <div className="text-muted-foreground">This may take a few moments...</div>
          </div>
        )}

        {gameMode === 'multiplayer' && multiplayerState.phase === 'showingVerdicts' && (
          <MultiplayerVerdicts
            scenario={multiplayerState.scenario}
            roundNumber={multiplayerState.currentRound}
            onAdvanceToLeaderboard={handleAdvanceToLeaderboard}
            isHost={isHost}
          />
        )}

        {gameMode === 'multiplayer' && multiplayerState.phase === 'showingLeaderboard' && (
          <MultiplayerLeaderboard
            roundNumber={multiplayerState.currentRound}
            onNextRound={handleNextRound}
            onEndGame={handleEndGame}
            isHost={isHost}
            totalRounds={scenarios.length}
          />
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
