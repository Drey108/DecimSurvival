import { useState, useEffect } from 'react';
import { insertCoin } from 'playroomkit';
import APIKeyModal from '../components/APIKeyModal';
import GameScreen from '../components/GameScreen';
import ResultDisplay from '../components/ResultDisplay';
import MultiplayerResults from '../components/MultiplayerResults';
import MultiplayerFinalResults from '../components/MultiplayerFinalResults';
import ModeSelector from '../components/ModeSelector';
import RoomSetup from '../components/RoomSetup';
import MultiplayerLobby from '../components/MultiplayerLobby';
import ConnectionWarning from '../components/ConnectionWarning';
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

interface IndexProps {
  multiplayerGameState: any;
  setMultiplayerGameState: (state: any) => void;
  players: any[];
  currentPlayer: any;
  isHost: boolean;
}

const Index = ({ 
  multiplayerGameState, 
  setMultiplayerGameState, 
  players, 
  currentPlayer, 
  isHost 
}: IndexProps) => {
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
  const [showConnectionWarning, setShowConnectionWarning] = useState(false);
  const [multiplayerResults, setMultiplayerResults] = useState<any[]>([]);
  const [playerStats, setPlayerStats] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { analyzeStrategy, isLoading } = useGroqAPI(apiKey);

  // Sync multiplayer results from state
  useEffect(() => {
    if (multiplayerGameState?.results) {
      setMultiplayerResults(multiplayerGameState.results);
    }
  }, [multiplayerGameState?.results]);

  // Handle multiplayer phase transitions
  useEffect(() => {
    if (multiplayerGameState?.phase === 'analyzing' && isHost && !isAnalyzing) {
      handleMultiplayerAnalysis();
    }
  }, [multiplayerGameState?.phase, isHost, isAnalyzing]);

  const handleMultiplayerAnalysis = async () => {
    if (!multiplayerGameState || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      const results = [];
      
      // Analyze each player's strategy
      for (const player of players) {
        const playerSub = multiplayerGameState.playerSubmissions[player.id];
        const playerName = player.getProfile()?.name || `Player ${player.id}`;
        
        let result;
        if (playerSub?.timeUp || !playerSub?.strategy?.trim()) {
          // Player timed out or no strategy
          result = {
            narrative: "Time ran out! You panicked and couldn't form a coherent survival strategy.",
            survived: false
          };
        } else {
          // Analyze the strategy
          result = await analyzeStrategy(multiplayerGameState.scenario, playerSub.strategy);
        }
        
        results.push({
          playerId: player.id,
          playerName,
          strategy: playerSub?.strategy || '',
          narrative: result.narrative,
          survived: result.survived,
          timeUp: playerSub?.timeUp || false
        });
      }
      
      setMultiplayerResults(results);
      
      // Update multiplayer state to results phase
      setMultiplayerGameState({
        ...multiplayerGameState,
        phase: 'results',
        results: results
      });
      
    } catch (error) {
      setError('Failed to analyze strategies');
    } finally {
      setIsAnalyzing(false);
    }
  };

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
      if (currentPlayer) {
        currentPlayer.setState('profile', { name: playerName.trim() });
      }
      
      setMultiplayerGameState({
        phase: 'lobby',
        currentRound: 1,
        scenario: '',
        hostApiKey: '',
        timeLeft: 60,
        playerSubmissions: {}
      });
      setGameMode('lobby');
    } catch (error) {
      setError('Failed to create room');
      setShowConnectionWarning(true);
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
      if (currentPlayer) {
        currentPlayer.setState('profile', { name: playerName.trim() });
      }
      
      setGameMode('lobby');
    } catch (error) {
      setError('Failed to join room');
      setShowConnectionWarning(true);
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
    
    // Initialize player stats
    const initialStats = players.map(player => ({
      playerId: player.id,
      playerName: player.getProfile()?.name || `Player ${player.id}`,
      survivals: 0,
      totalRounds: 0
    }));
    setPlayerStats(initialStats);
    
    // Initialize multiplayer game state with timer and empty submissions
    const initialSubmissions = {};
    players.forEach(player => {
      initialSubmissions[player.id] = {
        strategy: '',
        submitted: false,
        timeUp: false,
        isTyping: false
      };
    });
    
    const newState = {
      ...multiplayerGameState,
      hostApiKey,
      phase: 'input',
      scenario: randomScenario,
      timeLeft: 60,
      playerSubmissions: initialSubmissions,
      currentRound: 1
    };
    setMultiplayerGameState(newState);
    setCurrentRound(1);
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
    setMultiplayerResults([]);
    setPlayerStats([]);
  };

  const handleMultiplayerNextRound = () => {
    if (!isHost || !multiplayerGameState) return;
    
    // Update player stats
    const updatedStats = playerStats.map(stat => {
      const playerResult = multiplayerResults.find(r => r.playerId === stat.playerId);
      return {
        ...stat,
        survivals: stat.survivals + (playerResult?.survived ? 1 : 0),
        totalRounds: stat.totalRounds + 1
      };
    });
    setPlayerStats(updatedStats);
    
    if (currentRound >= 3) {
      // Game finished
      setMultiplayerGameState({
        ...multiplayerGameState,
        phase: 'final-results'
      });
    } else {
      // Next round
      const nextRound = currentRound + 1;
      const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
      setCurrentRound(nextRound);
      setCurrentScenario(randomScenario);
      
      // Reset submissions for next round
      const resetSubmissions = {};
      players.forEach(player => {
        resetSubmissions[player.id] = {
          strategy: '',
          submitted: false,
          timeUp: false,
          isTyping: false
        };
      });
      
      setMultiplayerGameState({
        ...multiplayerGameState,
        phase: 'input',
        scenario: randomScenario,
        currentRound: nextRound,
        timeLeft: 60,
        playerSubmissions: resetSubmissions
      });
      setMultiplayerResults([]);
    }
  };

  const handleMultiplayerFinishGame = () => {
    if (!isHost || !multiplayerGameState) return;
    
    // Update final stats
    const finalStats = playerStats.map(stat => {
      const playerResult = multiplayerResults.find(r => r.playerId === stat.playerId);
      return {
        ...stat,
        survivals: stat.survivals + (playerResult?.survived ? 1 : 0),
        totalRounds: 3
      };
    });
    setPlayerStats(finalStats);
    
    setMultiplayerGameState({
      ...multiplayerGameState,
      phase: 'final-results'
    });
  };

  const handleMultiplayerPlayAgain = () => {
    if (!isHost) return;
    handleMultiplayerStartGame(apiKey);
  };

  const handleMultiplayerLeaveGame = () => {
    setGameMode('menu');
    setGameState('setup');
    setMultiplayerResults([]);
    setPlayerStats([]);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">DECIM</h1>
          <p className="text-muted-foreground">Survival Game</p>
        </header>

        <ConnectionWarning 
          show={showConnectionWarning} 
          onDismiss={() => setShowConnectionWarning(false)} 
        />

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
            players={players}
            isHost={isHost}
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

        {gameState === 'playing' && multiplayerGameState?.phase === 'input' && (
          <GameScreen
            scenario={currentScenario}
            roundNumber={currentRound}
            onStrategySubmit={handleStrategySubmit}
            isLoading={isLoading}
            isMultiplayer={gameMode === 'single' && multiplayerGameState?.phase === 'input'}
            multiplayerGameState={multiplayerGameState}
            setMultiplayerGameState={setMultiplayerGameState}
            players={players}
            currentPlayer={currentPlayer}
          />
        )}

        {gameState === 'playing' && multiplayerGameState?.phase === 'analyzing' && (
          <div className="text-center">
            <div className="text-xl mb-4">AI is analyzing all strategies...</div>
            <div className="text-muted-foreground">This may take a few moments...</div>
          </div>
        )}

        {gameState === 'playing' && multiplayerGameState?.phase === 'results' && (
          <MultiplayerResults
            playerResults={multiplayerResults}
            onNextRound={handleMultiplayerNextRound}
            onFinishGame={handleMultiplayerFinishGame}
            roundNumber={currentRound}
            isHost={isHost}
          />
        )}

        {gameState === 'playing' && multiplayerGameState?.phase === 'final-results' && (
          <MultiplayerFinalResults
            playerStats={playerStats}
            onPlayAgain={handleMultiplayerPlayAgain}
            onLeaveGame={handleMultiplayerLeaveGame}
            isHost={isHost}
          />
        )}

        {gameState === 'playing' && !multiplayerGameState?.phase && (
          <GameScreen
            scenario={currentScenario}
            roundNumber={currentRound}
            onStrategySubmit={handleStrategySubmit}
            isLoading={isLoading}
            isMultiplayer={false}
            multiplayerGameState={multiplayerGameState}
            setMultiplayerGameState={setMultiplayerGameState}
            players={players}
            currentPlayer={currentPlayer}
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
