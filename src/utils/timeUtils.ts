import { ClockDisplay, TimeFormat } from '../types';
import { IST_TIMEZONE } from './constants';

/**
 * Utility functions for time formatting and IST conversion
 */

/**
 * Get current IST time as Date object with error handling
 */
export const getCurrentISTTime = (): Date => {
  try {
    const now = new Date();
    
    // Validate that we got a valid date
    if (isNaN(now.getTime())) {
      console.error('Invalid date object created, using fallback');
      return new Date(Date.now()); // Fallback to current timestamp
    }
    
    return now;
  } catch (error) {
    console.error('Error getting current time:', error);
    // Ultimate fallback - create date from timestamp
    return new Date(Date.now());
  }
};

/**
 * Format time for display according to the specified format with comprehensive error handling
 */
export const formatTimeForDisplay = (date: Date, timeFormat: TimeFormat): ClockDisplay => {
  // Validate input date
  if (!date || isNaN(date.getTime())) {
    console.error('Invalid date provided to formatTimeForDisplay, using current time');
    date = getCurrentISTTime();
  }

  // Validate time format
  if (!isValidTimeFormat(timeFormat)) {
    console.warn(`Invalid time format: ${timeFormat}, defaulting to 12h`);
    timeFormat = '12h';
  }

  try {
    // Get IST time components
    const istOptions: Intl.DateTimeFormatOptions = {
      timeZone: IST_TIMEZONE,
      hour12: timeFormat === '12h',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    };

    const formatter = new Intl.DateTimeFormat('en-IN', istOptions);
    const parts = formatter.formatToParts(date);

    // Extract parts with fallbacks
    const hour = parts.find(part => part.type === 'hour')?.value || '00';
    const minute = parts.find(part => part.type === 'minute')?.value || '00';
    const second = parts.find(part => part.type === 'second')?.value || '00';
    const dayPeriod = parts.find(part => part.type === 'dayPeriod')?.value || '';
    const weekday = parts.find(part => part.type === 'weekday')?.value || 'Unknown';
    const month = parts.find(part => part.type === 'month')?.value || 'Unknown';
    const day = parts.find(part => part.type === 'day')?.value || '1';

    // Validate extracted values
    if (!hour || !minute || !second) {
      throw new Error('Failed to extract time components');
    }

    // Format according to the design: "10:03" "AM\n24" "Friday - September 12"
    const timeLeft = `${hour}:${minute}`;
    const timeRight = timeFormat === '12h' ? `${dayPeriod.toUpperCase()}\n${second}` : second;
    const dateBottom = `${weekday} - ${month} ${day}`;

    return {
      timeLeft,
      timeRight,
      dateBottom,
    };
  } catch (error) {
    console.error('Error formatting time with Intl.DateTimeFormat:', error);
    
    // Enhanced fallback formatting
    try {
      return getFallbackTimeDisplay(date, timeFormat);
    } catch (fallbackError) {
      console.error('Fallback time formatting also failed:', fallbackError);
      return getEmergencyTimeDisplay();
    }
  }
};

/**
 * Fallback time formatting using basic Date methods
 */
const getFallbackTimeDisplay = (date: Date, timeFormat: TimeFormat): ClockDisplay => {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  
  let timeLeft: string;
  let timeRight: string;
  
  if (timeFormat === '12h') {
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    timeLeft = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    timeRight = `${ampm}\n${seconds.toString().padStart(2, '0')}`;
  } else {
    timeLeft = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    timeRight = seconds.toString().padStart(2, '0');
  }
  
  // Basic date formatting
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const weekday = weekdays[date.getDay()] || 'Unknown';
  const month = months[date.getMonth()] || 'Unknown';
  const day = date.getDate();
  
  const dateBottom = `${weekday} - ${month} ${day}`;
  
  return { timeLeft, timeRight, dateBottom };
};

/**
 * Emergency fallback when all time formatting fails
 */
const getEmergencyTimeDisplay = (): ClockDisplay => {
  const now = Date.now();
  const date = new Date(now);
  
  return {
    timeLeft: '00:00',
    timeRight: 'AM 00',
    dateBottom: `Error - ${date.toDateString()}`,
  };
};

/**
 * Validate if a time format is supported
 */
export const isValidTimeFormat = (format: string): format is TimeFormat => {
  return format === '12h' || format === '24h';
};

/**
 * Get timezone offset for IST
 */
export const getISTOffset = (): string => {
  const date = new Date();
  const istTime = new Date(date.toLocaleString('en-US', { timeZone: IST_TIMEZONE }));
  const utcTime = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const offsetMs = istTime.getTime() - utcTime.getTime();
  const offsetHours = offsetMs / (1000 * 60 * 60);
  
  return offsetHours >= 0 ? `+${offsetHours}:30` : `${offsetHours}:30`;
};

/**
 * Check if current time is in IST timezone
 */
export const isISTTimezone = (): boolean => {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return timeZone === IST_TIMEZONE;
  } catch {
    return false;
  }
};