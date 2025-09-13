import { useState, useEffect, useCallback, useRef } from 'react';
import { MOUSE_ACTIVITY } from '../utils/constants';

/**
 * Custom hook for detecting mouse activity and auto-hiding UI elements
 */
export const useMouseActivity = () => {
  const [isActive, setIsActive] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  // Clear existing timeout
  const clearActivityTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // Set timeout to hide UI after inactivity
  const setActivityTimeout = useCallback(() => {
    clearActivityTimeout();
    
    timeoutRef.current = setTimeout(() => {
      setIsActive(false);
    }, MOUSE_ACTIVITY.HIDE_DELAY);
  }, [clearActivityTimeout]);

  // Handle mouse activity
  const handleMouseActivity = useCallback(() => {
    const now = Date.now();
    
    // Debounce mouse events to avoid excessive updates
    if (now - lastActivityRef.current < MOUSE_ACTIVITY.DEBOUNCE_DELAY) {
      return;
    }
    
    lastActivityRef.current = now;
    
    // Show settings panel
    if (!isActive) {
      setIsActive(true);
    }
    
    // Reset hide timer
    setActivityTimeout();
  }, [isActive, setActivityTimeout]);

  // Force show settings (for manual triggers)
  const showSettings = useCallback(() => {
    setIsActive(true);
    setActivityTimeout();
  }, [setActivityTimeout]);

  // Force hide settings
  const hideSettings = useCallback(() => {
    setIsActive(false);
    clearActivityTimeout();
  }, [clearActivityTimeout]);

  // Set up mouse event listeners
  useEffect(() => {
    const events = ['mousemove', 'mouseenter', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleMouseActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleMouseActivity);
      });
      clearActivityTimeout();
    };
  }, [handleMouseActivity, clearActivityTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      clearActivityTimeout();
    };
  }, [clearActivityTimeout]);

  return {
    isActive,
    showSettings,
    hideSettings,
  };
};