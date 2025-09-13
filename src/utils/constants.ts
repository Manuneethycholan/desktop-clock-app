import { AppConfig, AppSettings, CategoryConfig } from '../types';

// Available wallpaper categories (based on actual available images)
export const WALLPAPER_CATEGORIES: CategoryConfig[] = [
  { name: 'rajini', displayName: 'Rajini', imageCount: 11, enabled: true },
  { name: 'kamal', displayName: 'Kamal', imageCount: 5, enabled: true },
  { name: 'common_mass', displayName: 'Common Mass', imageCount: 16, enabled: true },
  { name: 'automobile', displayName: 'Automobile', imageCount: 32, enabled: true },
  { name: 'motivational', displayName: 'Motivational', imageCount: 21, enabled: true },
  { name: 'nature', displayName: 'Nature', imageCount: 11, enabled: true },
  { name: 'spiritual', displayName: 'Spiritual', imageCount: 4, enabled: true },
  { name: 'random', displayName: 'Random', imageCount: 4, enabled: true },
  { name: 'ai', displayName: 'AI', imageCount: 4, enabled: true },
  { name: 'anime', displayName: 'Anime', imageCount: 34, enabled: true },
  { name: 'tech', displayName: 'Tech', imageCount: 0, enabled: true },
];

// Available rotation intervals (in milliseconds)
export const ROTATION_INTERVALS = [
  { value: 30000, label: '30 seconds' },
  { value: 60000, label: '1 minute' },
  { value: 300000, label: '5 minutes' },
  { value: 600000, label: '10 minutes' },
];

// Available font colors - Light and Dark variants
export const FONT_COLORS = [
  // Light colors (first column)
  { name: 'White', value: '#ffffff' },
  { name: 'Light Blue', value: '#87ceeb' },
  { name: 'Light Green', value: '#90ee90' },
  { name: 'Light Coral', value: '#f08080' },
  { name: 'Light Pink', value: '#ffb6c1' },
  { name: 'Light Orange', value: '#ffd700' },
  { name: 'Light Cyan', value: '#e0ffff' },
  { name: 'Light Salmon', value: '#ffa07a' },
  // Dark colors (second column)
  { name: 'Dark Blue', value: '#4169e1' },
  { name: 'Dark Green', value: '#228b22' },
  { name: 'Dark Red', value: '#dc143c' },
  { name: 'Dark Orange', value: '#ff8c00' },
  { name: 'Purple', value: 'rgb(135, 55, 225)' },
  { name: 'Dark Cyan', value: '#008b8b' },
  { name: 'Dark Brown', value: '#8b4513' },
  { name: 'Dark Gray', value: '#696969' },
];

// Available font families
export const FONT_FAMILIES = [
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  { name: 'Times New Roman', value: 'Times New Roman, serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
];

// Default application settings
export const DEFAULT_SETTINGS: AppSettings = {
  clockEnabled: true,
  wallpaperEnabled: true,
  selectedCategories: ['rajini', 'kamal', 'automobile', 'nature'], // Start with categories that have images
  rotationInterval: 60000, // 1 minute default
  timeFormat: '12h',
  fontColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  displayMode: 'digital-clock',
};

// Application configuration
export const APP_CONFIG: AppConfig = {
  categories: WALLPAPER_CATEGORIES,
  defaultSettings: DEFAULT_SETTINGS,
  rotationIntervals: ROTATION_INTERVALS.map(interval => interval.value),
};

// Local storage keys
export const STORAGE_KEYS = {
  SETTINGS: 'desktop-clock-settings',
  VERSION: '1.0.0',
} as const;

// Mouse activity settings
export const MOUSE_ACTIVITY = {
  HIDE_DELAY: 3000, // Hide settings after 3 seconds of inactivity
  DEBOUNCE_DELAY: 100, // Debounce mouse movement events
} as const;



// Time update interval
export const TIME_UPDATE_INTERVAL = 1000; // Update every second

// IST timezone
export const IST_TIMEZONE = 'Asia/Kolkata';

// CSS class names
export const CSS_CLASSES = {
  WALLPAPER_CONTAINER: 'wallpaper-container',
  WALLPAPER_IMAGE: 'wallpaper-image',
  CLOCK_CONTAINER: 'clock-container',
  CLOCK_FULLSCREEN: 'clock-fullscreen',
  CLOCK_BOTTOM_LEFT: 'clock-bottom-left',
  SETTINGS_PANEL: 'settings-panel',
  SETTINGS_VISIBLE: 'settings-visible',
  SETTINGS_HIDDEN: 'settings-hidden',
} as const;