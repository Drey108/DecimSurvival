import { useState, useEffect } from 'react';
import { useMultiplayerState, useIsHost, usePlayersList, myPlayer } from 'playroomkit';
import RoomJoin from '../components/RoomJoin';
import Lobby from '../components/Lobby';
import MultiplayerGameScreen from '../components/MultiplayerGameScreen';
import WaitingScreen from '../components/WaitingScreen';
import ResultsViewer from '../components/ResultsViewer';
import MultiplayerLeaderboard from '../components/MultiplayerLeaderboard';
import { useGroqAPI } from '../hooks/useGroqAPI';
import type { GameState as MultiplayerGameState, PlayerStrategy, PlayerResult, PlayerScore } from '../types/multiplayer';

type LocalGameState = 'joining' | 'lobby' | 'playing' | 'waiting' | 'results' | 'leaderboard' | 'finished';

const scenarios = [
  "Zombie outbreak in shopping mall. You're trapped with limited supplies. Survive 24 hours.",
  "Plane crashed on deserted island. You have only clothes on your back. What's your plan?", 
  "Nuclear war started. 10 minutes before fallout hits your area. How do you survive?",
  "Stuck in blizzard in your car on empty highway. No cell service. Temperature dropping.",
  "Building fire on 15th floor. Elevators down, stairs blocked by smoke. How do you escape?"
];

const Index = () => {
  const [gameState, setGameState] = useState<LocalGameState>('joining');
  const [error, setError] = useState('');
  
  // Multiplayer state with proper typing
  const defaultGameState: MultiplayerGameState = {
    phase: 'lobby',
    currentRound: 1,
    scenario: '',
    timeLeft: 60,
    currentResultIndex: 0,
    hostApiKey: ''
  };
  
  const [multiplayerGameState, setMultiplayerGameState] = useMultiplayerState('gameState', defaultGameState);
  const [playerStrategies, setPlayerStrategies] = useMultiplayerState('playerStrategies', {} as Record<string, PlayerStrategy>);
  const [roundResults, setRoundResults] = useMultiplayerState('roundResults', [] as PlayerResult[]);
  const [playerScores, setPlayerScores] = useMultiplayerState('playerScores', {} as Record<string, PlayerScore>);
  
  const isHost = useIsHost();
  const players = usePlayersList(true);
  const currentPlayer = myPlayer();
  
  const apiKey = multiplayerGameState?.hostApiKey || '';
  const { analyzeMultipleStrategies, isLoading } = useGroqAPI(apiKey);

  // Initialize player scores when joining
  useEffect(() => {
    if (currentPlayer && !playerScores?.[currentPlayer.id]) {
      setPlayerScores({
        ...playerScores,
        [currentPlayer.id]: {
          name: currentPlayer.getProfile()?.name || 'Unknown',
          score: 0
        }
      });
    }
  }, [currentPlayer, playerScores, setPlayerScores]);

  const handleJoinRoom = () => {
    setGameState('lobby');
  };

  const handleStartGame = () => {
    if (!isHost) return;
    
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    setMultiplayerGameState({
      phase: 'playing',
      currentRound: 1,
      scenario: randomScenario,
      timeLeft: 60,
      currentResultIndex: 0,
      hostApiKey: multiplayerGameState?.hostApiKey || ''
    });
    setPlayerStrategies({});
    setGameState('playing');
  };

  const handleAllStrategiesSubmitted = async () => {
    if (!isHost || !playerStrategies) return;
    
    setGameState('waiting');
    
    try {
      setError('');
      const strategies = Object.values(playerStrategies) as any[];
      const results = await analyzeMultipleStrategies(multiplayerGameState.scenario, strategies);
      
      setRoundResults(results);
      setMultiplayerGameState({
        ...multiplayerGameState,
        currentResultIndex: 0
      });
      setGameState('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze strategies');
      setGameState('playing');
    }
  };

  const handleNextResult = () => {
    if (!isHost) return;
    
    const nextIndex = (multiplayerGameState?.currentResultIndex || 0) + 1;
    setMultiplayerGameState({
      ...multiplayerGameState,
      currentResultIndex: nextIndex
    });
  };

  const handleFinishResults = () => {
    if (!isHost || !roundResults) return;
    
    // Update player scores
    const newScores = { ...playerScores };
    roundResults.forEach((result: any) => {
      if (newScores[result.playerId]) {
        if (result.survived) {
          newScores[result.playerId].score += 1;
        }
      }
    });
    setPlayerScores(newScores);
    
    setGameState('leaderboard');
  };

  const handleNextRound = () => {
    if (!isHost) return;
    
    if ((multiplayerGameState?.currentRound || 1) >= 3) {
      setGameState('finished');
      return;
    }
    
    const nextRound = (multiplayerGameState?.currentRound || 1) + 1;
    const randomScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    setMultiplayerGameState({
      ...multiplayerGameState,
      currentRound: nextRound,
      scenario: randomScenario,
      currentResultIndex: 0
    });
    setPlayerStrategies({});
    setRoundResults([]);
    setGameState('playing');
  };

  const handleFinishGame = () => {
    if (!isHost) return;
    
    // Reset all game state
    setMultiplayerGameState({
      phase: 'lobby',
      currentRound: 1,
      scenario: '',
      timeLeft: 60,
      currentResultIndex: 0,
      hostApiKey: multiplayerGameState?.hostApiKey || ''
    });
    setPlayerStrategies({});
    setRoundResults([]);
    // Don't reset player scores for play again
    setGameState('lobby');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">DECIM</h1>
          <p className="text-muted-foreground">Multiplayer Survival Game</p>
        </header>

        {gameState === 'joining' && (
          <RoomJoin onJoinRoom={handleJoinRoom} />
        )}

        {gameState === 'lobby' && (
          <Lobby onStartGame={handleStartGame} />
        )}

        {gameState === 'playing' && (
          <MultiplayerGameScreen 
            onAllStrategiesSubmitted={handleAllStrategiesSubmitted}
          />
        )}

        {gameState === 'waiting' && (
          <WaitingScreen />
        )}

        {gameState === 'results' && (
          <ResultsViewer 
            onNextResult={handleNextResult}
            onFinishResults={handleFinishResults}
          />
        )}

        {gameState === 'leaderboard' && (
          <MultiplayerLeaderboard 
            onNextRound={handleNextRound}
            onFinishGame={handleFinishGame}
            isFinal={false}
          />
        )}

        {gameState === 'finished' && (
          <MultiplayerLeaderboard 
            onNextRound={handleNextRound}
            onFinishGame={handleFinishGame}
            isFinal={true}
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
