import { useState, useEffect, useRef, useCallback } from 'react';

interface SinglePlayerTimerProps {
  onTimeUp: () => void;
  isActive: boolean;
  duration?: number;
}

const SinglePlayerTimer = ({ onTimeUp, isActive, duration = 60 }: SinglePlayerTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update ref when onTimeUp changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Reset timer when duration changes
  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  // Timer logic with stable references
  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive]);

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

  if (!isActive) return null;

  return (
    <div className={`text-2xl font-bold ${getTimerColor()}`}>
      Time: {formatTime(timeLeft)}
    </div>
  );
};

export default SinglePlayerTimer;