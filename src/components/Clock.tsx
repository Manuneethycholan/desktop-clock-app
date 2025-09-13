import React, { useState, useEffect, useCallback } from 'react';
import { ClockProps, ClockDisplay } from '../types';
import { formatTimeForDisplay, getCurrentISTTime } from '../utils/timeUtils';
import { TIME_UPDATE_INTERVAL, CSS_CLASSES } from '../utils/constants';
import '../styles/Clock.css';

/**
 * Clock component that displays IST time in the specified two-line format
 * Line 1: "HH:MM" on left, "AM/PM SS" on right
 * Line 2: "Day - Month Date"
 */
const Clock: React.FC<ClockProps> = ({ 
  isFullScreen, 
  position, 
  timeFormat,
  fontColor,
  fontFamily
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => {
    try {
      return getCurrentISTTime();
    } catch (error) {
      console.error('Error initializing clock time:', error);
      return new Date();
    }
  });
  
  const [clockDisplay, setClockDisplay] = useState<ClockDisplay>(() => {
    try {
      return formatTimeForDisplay(getCurrentISTTime(), timeFormat);
    } catch (error) {
      console.error('Error initializing clock display:', error);
      return {
        timeLeft: '00:00',
        timeRight: 'AM 00',
        dateBottom: 'Error - Loading...',
      };
    }
  });

  const [hasError, setHasError] = useState(false);

  // Update time display with error handling
  const updateTime = useCallback(() => {
    try {
      const newTime = getCurrentISTTime();
      const newDisplay = formatTimeForDisplay(newTime, timeFormat);
      
      setCurrentTime(newTime);
      setClockDisplay(newDisplay);
      
      // Clear error state if update succeeds
      if (hasError) {
        setHasError(false);
      }
    } catch (error) {
      console.error('Error updating clock time:', error);
      setHasError(true);
      
      // Set error display
      setClockDisplay({
        timeLeft: 'ERROR',
        timeRight: '00',
        dateBottom: 'Time Update Failed',
      });
    }
  }, [timeFormat, hasError]);

  // Set up time update interval with error recovery
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    try {
      interval = setInterval(updateTime, TIME_UPDATE_INTERVAL);
      
      // Update immediately on mount
      updateTime();
    } catch (error) {
      console.error('Error setting up clock interval:', error);
      setHasError(true);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [updateTime]);

  // Update display when time format changes
  useEffect(() => {
    try {
      const newDisplay = formatTimeForDisplay(currentTime, timeFormat);
      setClockDisplay(newDisplay);
    } catch (error) {
      console.error('Error updating time format:', error);
      setHasError(true);
    }
  }, [timeFormat, currentTime]);

  // Determine CSS classes based on props
  const getClockClasses = (): string => {
    const baseClass = CSS_CLASSES.CLOCK_CONTAINER;
    const positionClass = isFullScreen 
      ? CSS_CLASSES.CLOCK_FULLSCREEN 
      : CSS_CLASSES.CLOCK_BOTTOM_LEFT;
    
    return `${baseClass} ${positionClass}`;
  };

  return (
    <div 
      className={`${getClockClasses()} ${hasError ? 'clock-error' : ''}`}
      style={{
        color: fontColor,
        fontFamily: fontFamily
      }}
    >
      <div className="clock-time-line">
        <span className="clock-time-left">{clockDisplay.timeLeft}</span>
        <span className="clock-time-right">{clockDisplay.timeRight}</span>
      </div>
      <div className="clock-date-line">
        <span className="clock-date">{clockDisplay.dateBottom}</span>
      </div>
      {hasError && (
        <div className="clock-error-indicator" title="Clock update error - check console">
          ⚠️
        </div>
      )}
    </div>
  );
};

export default Clock;