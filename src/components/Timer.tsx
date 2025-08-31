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
    return 'text-success';
  };

  const getTimerGlow = () => {
    if (timeLeft <= 10) return 'shadow-lg shadow-destructive/50';
    if (timeLeft <= 30) return 'shadow-lg shadow-warning/50';
    return 'shadow-lg shadow-success/50';
  };

  const getProgressWidth = () => {
    return (timeLeft / 60) * 100;
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-0">
      <div className="text-center">
        <h4 className="font-orbitron font-bold text-lg text-foreground mb-4 flex items-center justify-center">
          <span className="w-2 h-2 bg-destructive rounded-full mr-3 animate-pulse"></span>
          Mission Timer
        </h4>
        
        <div className={`inline-flex items-center justify-center w-32 h-32 rounded-full ${getTimerGlow()} bg-card/50 border-4 ${
          timeLeft <= 10 ? 'border-destructive animate-pulse' : 
          timeLeft <= 30 ? 'border-warning' : 
          'border-success'
        } mb-4`}>
          <span className={`text-4xl font-orbitron font-black ${getTimerColor()}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        
        {/* Progress Ring */}
        <div className="relative w-40 h-40 mx-auto mb-4">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * getProgressWidth()) / 100}
              strokeLinecap="round"
              className={`transition-all duration-1000 ${getTimerColor()}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-orbitron font-black ${getTimerColor()}`}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                REMAINING
              </div>
            </div>
          </div>
        </div>
        
        {timeLeft <= 10 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
            <p className="text-sm text-destructive font-semibold animate-pulse">
              ⚠️ TIME CRITICAL! Submit now or face the consequences!
            </p>
          </div>
        )}
        
        {timeLeft > 10 && timeLeft <= 30 && (
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-3">
            <p className="text-sm text-warning font-semibold">
              ⏰ Time is running short. Finalize your strategy!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Timer;