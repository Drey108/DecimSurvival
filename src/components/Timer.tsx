import { useState, useEffect } from 'react';
import { useMultiplayerState } from 'playroomkit';

interface TimerProps {
  onTimeUp: () => void;
}

const Timer = ({ onTimeUp }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState] = useMultiplayerState('game', {
    phase: 'collectingSubmissions',
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

  useEffect(() => {
    const updateTimer = () => {
      if (!gameState.roundEndTime) return;
      
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((gameState.roundEndTime - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.roundEndTime, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= 10) return 'text-destructive';
    if (timeLeft <= 30) return 'text-warning';
    return 'text-foreground';
  };

  return (
    <div className={`text-2xl font-bold ${getTimerColor()}`}>
      Time: {formatTime(timeLeft)}
    </div>
  );
};

export default Timer;