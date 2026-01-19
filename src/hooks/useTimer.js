import { useState, useRef, useCallback, useEffect } from 'react';

export function useTimer(initialTime = 0) {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedTimeRef = useRef(initialTime);

  // Start the timer
  const start = useCallback(() => {
    if (isRunning) return;
    
    setIsRunning(true);
    startTimeRef.current = Date.now();
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      setTime(accumulatedTimeRef.current + elapsed);
    }, 10); // Update every 10ms for smooth display
  }, [isRunning]);

  // Pause the timer
  const pause = useCallback(() => {
    if (!isRunning) return;
    
    setIsRunning(false);
    clearInterval(intervalRef.current);
    
    // Save accumulated time
    const elapsed = Date.now() - startTimeRef.current;
    accumulatedTimeRef.current += elapsed;
    setTime(accumulatedTimeRef.current);
  }, [isRunning]);

  // Toggle between start and pause
  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, start, pause]);

  // Reset the timer
  const reset = useCallback(() => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    startTimeRef.current = null;
    accumulatedTimeRef.current = 0;
    setTime(0);
  }, []);

  // Set a specific time
  const setTimeTo = useCallback((newTime) => {
    accumulatedTimeRef.current = newTime;
    setTime(newTime);
    if (isRunning) {
      startTimeRef.current = Date.now();
    }
  }, [isRunning]);

  // Get current timestamp (for recording scores)
  const getTimestamp = useCallback(() => {
    if (isRunning) {
      const elapsed = Date.now() - startTimeRef.current;
      return accumulatedTimeRef.current + elapsed;
    }
    return time;
  }, [isRunning, time]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Format time for display
  const formatTime = useCallback((ms = time) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return {
      formatted: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`,
      minutes,
      seconds,
      centiseconds,
      total: ms,
    };
  }, [time]);

  return {
    time,
    isRunning,
    start,
    pause,
    toggle,
    reset,
    setTimeTo,
    getTimestamp,
    formatTime,
  };
}

export default useTimer;
