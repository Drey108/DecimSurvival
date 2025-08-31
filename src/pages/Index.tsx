import { useState, useEffect } from 'react';
import { insertCoin, useMultiplayerState, useIsHost, myPlayer, usePlayersList } from 'playroomkit';
import RoomSetup from '../components/RoomSetup';
import MultiplayerLobby from '../components/MultiplayerLobby';
import MultiplayerGameScreen from '../components/MultiplayerGameScreen';
import MultiplayerVerdicts from '../components/MultiplayerVerdicts';
import MultiplayerLeaderboard from '../components/MultiplayerLeaderboard';
import { useGroqAPI } from '../hooks/useGroqAPI';

type GameMode = 'multi-setup' | 'lobby' | 'multiplayer';
type MultiplayerPhase = 'lobby' | 'collectingSubmissions' | 'evaluating' | 'showingVerdicts' | 'showingLeaderboard' | 'roomEnded';

const scenarios = [
  "Zombie outbreak in shopping mall. You're trapped with limited supplies. Survive 24 hours.",
  "Plane crashed on deserted island. You have only clothes on your back. What's your plan?", 
  "Nuclear war started. 10 minutes before fallout hits your area. How do you survive?",
  "Stuck in blizzard in your car on empty highway. No cell service. Temperature dropping.",
  "Building fire on 15th floor. Elevators down, stairs blocked by smoke. How do you escape?"
];

const Index = () => {
  const [gameMode, setGameMode] = useState<GameMode>('multi-setup');
  const [apiKey, setApiKey] = useState('');
  const [currentScenario, setCurrentScenario] = useState('');
  const [error, setError] = useState('');
  
  // Multiplayer state
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  
  // Initialize multiplayer state
  const [multiplayerState, setMultiplayerState] = useMultiplayerState('game', {
    phase: 'lobby' as MultiplayerPhase,
    currentRound: 1,
    scenario: '',
    hostApiKey: '',
    submissions: {},
    verdicts: {},
    scores: {},
    playerNames: {},
    leaderboard: [],
    roundEndTime: 0,
    playersDone: {}
  });
  const isHost = useIsHost();
  const players = usePlayersList(true);

  const { analyzeStrategy, isLoading } = useGroqAPI(apiKey);

  // Handle room end - kick all players back to menu
  useEffect(() => {
    if (multiplayerState.phase === 'roomEnded') {
      setGameMode('multi-setup');
    }
  }, [multiplayerState.phase]);


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
        leaderboard: [],
        roundEndTime: 0,
        playersDone: {}
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
    
    setGameMode('multi-setup');
    // Reset the multiplayer state and set phase to signal room end
    setMultiplayerState({
      phase: 'roomEnded',
      currentRound: 1,
      scenario: '',
      hostApiKey: '',
      submissions: {},
      verdicts: {},
      scores: {},
      playerNames: {},
      leaderboard: [],
      roundEndTime: 0,
      playersDone: {}
    });
  };

  return (
    <div className="min-h-screen gradient-bg font-inter">
      {/* Modern Navigation Header */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-glow-pulse">
              <span className="text-primary-foreground font-orbitron font-bold text-sm">D</span>
            </div>
            <h1 className="text-2xl font-orbitron font-black text-foreground tracking-wide">
              DECIM
            </h1>
          </div>
          
          <div className="hidden md:flex items-center space-x-6 text-sm text-muted-foreground">
            <span>Survival Strategy Game</span>
            {roomCode && (
              <div className="flex items-center space-x-2 px-3 py-1 glass-card rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="font-mono text-success font-semibold">{roomCode}</span>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          
          {gameMode === 'multi-setup' && (
            <div className="animate-fade-in">
              {/* Hero Section */}
              <div className="text-center mb-12 pt-8">
                <div className="hero-gradient rounded-3xl p-12 mb-8">
                  <h2 className="text-6xl md:text-8xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-warning to-primary mb-6 animate-float">
                    SURVIVE
                  </h2>
                  <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Test your survival instincts in extreme scenarios. Make split-second decisions. 
                    <span className="text-primary font-semibold"> Will you survive?</span>
                  </p>
                  <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                    <span className="px-4 py-2 glass-card rounded-full">🧟 Zombie Outbreaks</span>
                    <span className="px-4 py-2 glass-card rounded-full">🏝️ Island Survival</span>
                    <span className="px-4 py-2 glass-card rounded-full">☢️ Nuclear Fallout</span>
                    <span className="px-4 py-2 glass-card rounded-full">🔥 Emergency Escapes</span>
                  </div>
                </div>
              </div>
              
              <RoomSetup
                playerName={playerName}
                setPlayerName={setPlayerName}
                onCreateRoom={handleCreateRoom}
                onJoinRoom={handleJoinRoom}
              />
            </div>
          )}

          {gameMode === 'lobby' && (
            <div className="animate-slide-up">
              <MultiplayerLobby
                roomCode={roomCode}
                onStartGame={handleMultiplayerStartGame}
                onLeaveRoom={handleLeaveRoom}
              />
            </div>
          )}

          {gameMode === 'multiplayer' && multiplayerState.phase === 'collectingSubmissions' && (
            <div className="animate-fade-in">
              <MultiplayerGameScreen
                scenario={multiplayerState.scenario}
                roundNumber={multiplayerState.currentRound}
                onAdvanceToVerdicts={handleAdvanceToVerdicts}
              />
            </div>
          )}

          {gameMode === 'multiplayer' && multiplayerState.phase === 'evaluating' && (
            <div className="text-center py-20 animate-fade-in">
              <div className="glass-card rounded-3xl p-12 max-w-md mx-auto">
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <h3 className="text-2xl font-orbitron font-bold text-foreground mb-4">AI Analysis</h3>
                <p className="text-muted-foreground">Our AI is evaluating all survival strategies...</p>
                <div className="mt-6 bg-muted/30 rounded-full h-2">
                  <div className="progress-glow h-2 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            </div>
          )}

          {gameMode === 'multiplayer' && multiplayerState.phase === 'showingVerdicts' && (
            <div className="animate-slide-up">
              <MultiplayerVerdicts
                scenario={multiplayerState.scenario}
                roundNumber={multiplayerState.currentRound}
                onAdvanceToLeaderboard={handleAdvanceToLeaderboard}
                isHost={isHost}
              />
            </div>
          )}

          {gameMode === 'multiplayer' && multiplayerState.phase === 'showingLeaderboard' && (
            <div className="animate-fade-in">
              <MultiplayerLeaderboard
                roundNumber={multiplayerState.currentRound}
                onNextRound={handleNextRound}
                onEndGame={handleEndGame}
                isHost={isHost}
                totalRounds={scenarios.length}
              />
            </div>
          )}

          {error && (
            <div className="fixed bottom-6 right-6 notification-slide">
              <div className="glass-card border-l-4 border-destructive rounded-lg p-4 max-w-md">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-destructive rounded-full flex-shrink-0 mt-0.5"></div>
                  <div>
                    <h4 className="font-semibold text-destructive-foreground">Error</h4>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
