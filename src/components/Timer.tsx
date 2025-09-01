import { useState, useEffect } from 'react';
import { useMultiplayerState, myPlayer } from 'playroomkit';

interface TimerProps {
  onTimeUp: () => void;
  isStopped?: boolean;
}

const Timer = ({ onTimeUp, isStopped = false }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [playerSubmissionTime, setPlayerSubmissionTime] = useState<number | null>(null);
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
    playersDone: {},
    submissionTimes: {}
  });

  // Track when current player submitted
  useEffect(() => {
    const myPlayerId = myPlayer()?.id;
    if (myPlayerId && gameState.submissionTimes?.[myPlayerId] && !playerSubmissionTime) {
      setPlayerSubmissionTime(gameState.submissionTimes[myPlayerId]);
    }
  }, [gameState.submissionTimes, playerSubmissionTime]);

  useEffect(() => {
    const updateTimer = () => {
      if (!gameState.roundEndTime) return;
      
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((gameState.roundEndTime - now) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0 && !isStopped) {
        onTimeUp();
      }
    };

    // Don't update timer if player has submitted (timer is stopped)
    if (isStopped || playerSubmissionTime) return;

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [gameState.roundEndTime, onTimeUp, isStopped, playerSubmissionTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate submission time for display
  const getSubmissionTime = () => {
    if (playerSubmissionTime && gameState.roundEndTime) {
      const submissionTimeFromStart = Math.floor((gameState.roundEndTime - playerSubmissionTime) / 1000);
      return 60 - submissionTimeFromStart; // Time taken to submit
    }
    return null;
  };

  const getTimerColor = () => {
    if (isStopped || playerSubmissionTime) return 'text-success';
    if (timeLeft <= 10) return 'text-destructive';
    if (timeLeft <= 30) return 'text-warning';
    return 'text-success';
  };

  const getTimerGlow = () => {
    if (isStopped || playerSubmissionTime) return 'shadow-lg shadow-success/50';
    if (timeLeft <= 10) return 'shadow-lg shadow-destructive/50';
    if (timeLeft <= 30) return 'shadow-lg shadow-warning/50';
    return 'shadow-lg shadow-success/50';
  };

  const getProgressWidth = () => {
    if (isStopped || playerSubmissionTime) return 100; // Full circle when stopped
    return (timeLeft / 60) * 100;
  };

  return (
    <div className="glass-card p-6 rounded-2xl border-0">
      <div className="text-center">
        <h4 className="font-orbitron font-bold text-lg text-foreground mb-4 flex items-center justify-center">
          <span className={`w-2 h-2 rounded-full mr-3 ${
            isStopped || playerSubmissionTime ? 'bg-success' : ''
          }`}></span>
          {isStopped || playerSubmissionTime ? 'Submitted!' : ''}
        </h4>
        
        
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
                {isStopped || playerSubmissionTime ? '✓' : formatTime(timeLeft)}
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                {isStopped || playerSubmissionTime ? 
                  (getSubmissionTime() ? `${getSubmissionTime()}s` : 'DONE') : 
                  'REMAINING'
                }
              </div>
            </div>
          </div>
        </div>
        
        {isStopped || playerSubmissionTime ? (
          <div className="bg-success/10 border border-success/20 rounded-xl p-3">
            <p className="text-sm text-success font-semibold">
              ✅ Strategy submitted! {getSubmissionTime() && `Completed in ${getSubmissionTime()} seconds`}
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};

export default Timer;