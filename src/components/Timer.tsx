import { useState, useEffect } from 'react';

interface TimerProps {
  duration: number;
  onTimeUp: () => void;
  isActive: boolean;
  syncedTimeLeft?: number;
}

const Timer = ({ duration, onTimeUp, isActive, syncedTimeLeft }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  // Use synced time if provided (for multiplayer)
  useEffect(() => {
    if (syncedTimeLeft !== undefined) {
      setTimeLeft(syncedTimeLeft);
    }
  }, [syncedTimeLeft]);

  useEffect(() => {
    if (!isActive) return;

    if (timeLeft <= 0) {
      onTimeUp();
      return;
    }

    // Use setInterval for more reliable timing that doesn't depend on user interactions
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isActive, onTimeUp]);

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