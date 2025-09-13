// Core application state interface
export interface AppState {
  clockEnabled: boolean;
  wallpaperEnabled: boolean;
  selectedCategories: string[];
  displayMode: 'digital-clock' | 'wallpaper' | 'focus-mode';
  settingsVisible: boolean;
  rotationInterval: number;
  timeFormat: '12h' | '24h';
}

// Clock component interfaces
export interface ClockProps {
  isFullScreen: boolean;
  position: 'center' | 'bottom-left';
  timeFormat: '12h' | '24h';
  fontColor: string;
  fontFamily: string;
}

export interface ClockState {
  currentTime: Date;
  timeFormat: '12h' | '24h';
}

export interface ClockDisplay {
  timeLeft: string; // "HH:MM" format
  timeRight: string; // "AM/PM SS" format  
  dateBottom: string; // "Day - Month Date" format
}

// Wallpaper component interfaces
export interface WallpaperProps {
  categories: string[];
  rotationInterval: number;
  enabled: boolean;
}

export interface WallpaperState {
  currentImage: string;
  imageIndex: number;
  availableImages: WallpaperImage[];
  isLoading: boolean;
}

export interface WallpaperImage {
  src: string;
  category: string;
  filename: string;
}

// Settings component interfaces
export interface SettingsProps {
  isVisible: boolean;
  onSettingsChange: (settings: Partial<AppSettings>) => void;
  currentSettings: AppSettings;
  onClose?: () => void;
}

export interface AppSettings {
  clockEnabled: boolean;
  wallpaperEnabled: boolean;
  selectedCategories: string[];
  rotationInterval: number;
  timeFormat: '12h' | '24h';
  fontColor: string;
  fontFamily: string;
  displayMode: 'digital-clock' | 'wallpaper' | 'focus-mode';
}

// Application configuration
export interface AppConfig {
  categories: CategoryConfig[];
  defaultSettings: AppSettings;
  rotationIntervals: number[];
}

export interface CategoryConfig {
  name: string;
  displayName: string;
  imageCount: number;
  enabled: boolean;
}

// Local storage schema
export interface StoredSettings {
  version: string;
  clockEnabled: boolean;
  wallpaperEnabled: boolean;
  selectedCategories: string[];
  rotationInterval: number;
  timeFormat: '12h' | '24h';
  fontColor: string;
  fontFamily: string;
  displayMode: 'digital-clock' | 'wallpaper' | 'focus-mode';
  lastUpdated: string;
}

// Utility types
export type DisplayMode = 'digital-clock' | 'wallpaper' | 'focus-mode';

export type TimeFormat = '12h' | '24h';
export type FontColor = string;
export type FontFamily = string;

// Focus Mode Timer interfaces
export interface FocusTimerProps {
  fontColor: string;
  fontFamily: string;
  timeFormat: '12h' | '24h';
}

export interface FocusTimerState {
  hours: number;
  minutes: number;
  seconds: number;
  isRunning: boolean;
  timeRemaining: number;
  showAlarm: boolean;
}

// Event handler types
export interface SettingsChangeHandler {
  (settings: Partial<AppSettings>): void;
}

export interface MouseActivityHandler {
  (): void;
}