import React, { useState, useEffect, useRef } from 'react';
import { FocusTimerProps, FocusTimerState } from '../types';
import '../styles/FocusTimer.css';

const FocusTimer: React.FC<FocusTimerProps> = ({ fontColor, fontFamily, timeFormat }) => {
  const [state, setState] = useState<FocusTimerState>({
    hours: 0,
    minutes: 25,
    seconds: 0,
    isRunning: false,
    timeRemaining: 0,
    showAlarm: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastScrollTime = useRef<number>(0);

  useEffect(() => {
    // Create audio element for alarm
    audioRef.current = new Audio();
    audioRef.current.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    
    // Initialize tick audio ref with an empty object
    tickAudioRef.current = {} as HTMLAudioElement;
    
    // Create a persistent audio context for tick sounds
    let audioContext: AudioContext | null = null;
    
    const initAudioContext = () => {
      if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      return audioContext;
    };
    
    const createTickSound = () => {
      try {
        const ctx = initAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(800, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
      } catch (error) {
        console.error('Error creating tick sound:', error);
      }
    };
    
    // Store the function for later use
    if (tickAudioRef.current) {
      (tickAudioRef.current as any).playTick = createTickSound;
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startTimer = () => {
    const totalSeconds = state.hours * 3600 + state.minutes * 60 + state.seconds;
    if (totalSeconds === 0) return;

    setState(prev => ({
      ...prev,
      isRunning: true,
      timeRemaining: totalSeconds,
    }));
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({
      ...prev,
      isRunning: false,
      timeRemaining: 0,
    }));
  };

  const resetTimer = () => {
    stopTimer();
    setState(prev => ({
      ...prev,
      showAlarm: false,
    }));
  };

  useEffect(() => {
    if (state.isRunning && state.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const newTimeRemaining = prev.timeRemaining - 1;
          if (newTimeRemaining <= 0) {
            // Timer finished - show alarm
            if (audioRef.current) {
              audioRef.current.play().catch(console.error);
            }
            return {
              ...prev,
              isRunning: false,
              timeRemaining: 0,
              showAlarm: true,
            };
          }
          return {
            ...prev,
            timeRemaining: newTimeRemaining,
          };
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, state.timeRemaining]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const handleInputChange = (type: 'hours' | 'minutes' | 'seconds', value: string) => {
    if (state.isRunning) return;
    
    const numValue = parseInt(value) || 0;
    let maxValue = 59;
    if (type === 'hours') maxValue = 23;
    
    const clampedValue = Math.max(0, Math.min(maxValue, numValue));
    
    setState(prev => ({
      ...prev,
      [type]: clampedValue
    }));
    
    // Play tick sound
    if (tickAudioRef.current && (tickAudioRef.current as any).playTick) {
      try {
        (tickAudioRef.current as any).playTick();
      } catch (error) {
        console.error('Error playing tick sound:', error);
      }
    }
  };

  const handleWheel = (type: 'hours' | 'minutes' | 'seconds', event: React.WheelEvent) => {
    if (state.isRunning) return;
    
    event.preventDefault();
    
    // Throttle scroll events to 100ms for medium pace
    const now = Date.now();
    if (now - lastScrollTime.current < 100) return;
    lastScrollTime.current = now;
    
    const direction = event.deltaY < 0 ? 'up' : 'down';

    setState(prev => {
      const newState = { ...prev };
      let changed = false;
      
      if (type === 'hours') {
        const newHours = direction === 'up' 
          ? Math.min(23, prev.hours + 1) 
          : Math.max(0, prev.hours - 1);
        if (newHours !== prev.hours) {
          newState.hours = newHours;
          changed = true;
        }
      } else if (type === 'minutes') {
        const newMinutes = direction === 'up' 
          ? Math.min(59, prev.minutes + 1) 
          : Math.max(0, prev.minutes - 1);
        if (newMinutes !== prev.minutes) {
          newState.minutes = newMinutes;
          changed = true;
        }
      } else if (type === 'seconds') {
        const newSeconds = direction === 'up' 
          ? Math.min(59, prev.seconds + 1) 
          : Math.max(0, prev.seconds - 1);
        if (newSeconds !== prev.seconds) {
          newState.seconds = newSeconds;
          changed = true;
        }
      }
      
      // Play tick sound if value changed
      if (changed && tickAudioRef.current && (tickAudioRef.current as any).playTick) {
        try {
          (tickAudioRef.current as any).playTick();
        } catch (error) {
          console.error('Error playing tick sound:', error);
        }
      }
      
      return newState;
    });
  };

  if (state.showAlarm) {
    return (
      <div className="focus-timer-container" style={{ fontFamily }}>
        <div className="alarm-display">
          <div className="alarm-message" style={{ color: fontColor }}>
            Time's Up!
          </div>
          <div className="congrats-message" style={{ color: fontColor }}>
            Congrats Focus Mode finished successfully
          </div>
          <button 
            className="alarm-dismiss-btn"
            onClick={resetTimer}
            style={{ color: fontColor, borderColor: fontColor }}
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  const displayTime = state.isRunning ? formatTime(state.timeRemaining) : {
    hours: state.hours.toString().padStart(2, '0'),
    minutes: state.minutes.toString().padStart(2, '0'),
    seconds: state.seconds.toString().padStart(2, '0'),
  };

  return (
    <div className="focus-timer-container" style={{ fontFamily }}>
      <div className="timer-display">
        <div className="time-setters">
          <div className="time-unit">
            <input
              type="number"
              min="0"
              max="23"
              className="time-input scrollable"
              style={{ color: fontColor, borderColor: fontColor }}
              value={displayTime.hours}
              onChange={(e) => handleInputChange('hours', e.target.value)}
              onWheel={(e) => handleWheel('hours', e)}
              disabled={state.isRunning}
              title="Type or scroll to change hours"
            />
            <div className="time-label" style={{ color: fontColor }}>Hours</div>
          </div>

          <div className="time-separator" style={{ color: fontColor }}>:</div>

          <div className="time-unit">
            <input
              type="number"
              min="0"
              max="59"
              className="time-input scrollable"
              style={{ color: fontColor, borderColor: fontColor }}
              value={displayTime.minutes}
              onChange={(e) => handleInputChange('minutes', e.target.value)}
              onWheel={(e) => handleWheel('minutes', e)}
              disabled={state.isRunning}
              title="Type or scroll to change minutes"
            />
            <div className="time-label" style={{ color: fontColor }}>Minutes</div>
          </div>

          <div className="time-separator" style={{ color: fontColor }}>:</div>

          <div className="time-unit">
            <input
              type="number"
              min="0"
              max="59"
              className="time-input scrollable"
              style={{ color: fontColor, borderColor: fontColor }}
              value={displayTime.seconds}
              onChange={(e) => handleInputChange('seconds', e.target.value)}
              onWheel={(e) => handleWheel('seconds', e)}
              disabled={state.isRunning}
              title="Type or scroll to change seconds"
            />
            <div className="time-label" style={{ color: fontColor }}>Seconds</div>
          </div>
        </div>

        <div className="timer-controls">
          {!state.isRunning ? (
            <button 
              className="start-btn"
              onClick={startTimer}
              style={{ color: fontColor, borderColor: fontColor }}
            >
              Start
            </button>
          ) : (
            <button 
              className="stop-btn"
              onClick={stopTimer}
              style={{ color: fontColor, borderColor: fontColor }}
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusTimer;