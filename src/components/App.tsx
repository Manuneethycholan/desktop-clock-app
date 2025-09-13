import React, { useState, useCallback, useEffect } from 'react';
import Clock from './Clock';
import Wallpaper from './Wallpaper';
import Settings from './Settings';
import SettingsButton from './SettingsButton';
import FocusTimer from './FocusTimer';
import ErrorBoundary from './ErrorBoundary';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useMouseActivity } from '../hooks/useMouseActivity';

import { AppState, AppSettings, DisplayMode } from '../types';
import { DEFAULT_SETTINGS } from '../utils/constants';
import { registerServiceWorker } from '../utils/serviceWorker';
import '../styles/App.css';
import '../styles/ErrorBoundary.css';

function App() {
  // Load settings from localStorage
  const { settings: storedSettings, isLoaded, saveSettings } = useLocalStorage();

  // Application state - initialize with defaults, will be updated when settings load
  const [appState, setAppState] = useState<AppState>({
    clockEnabled: DEFAULT_SETTINGS.clockEnabled,
    wallpaperEnabled: DEFAULT_SETTINGS.wallpaperEnabled,
    selectedCategories: DEFAULT_SETTINGS.selectedCategories,
    displayMode: DEFAULT_SETTINGS.displayMode,
    settingsVisible: false,
    rotationInterval: DEFAULT_SETTINGS.rotationInterval,
    timeFormat: DEFAULT_SETTINGS.timeFormat,
  });

  // Settings panel state (separate from mouse activity)
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);

  // Mouse activity detection for settings panel
  const { isActive } = useMouseActivity();

  // Register service worker for offline functionality
  useEffect(() => {
    registerServiceWorker({
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully');
      },
      onUpdate: (registration) => {
        console.log('New content available, please refresh');
        // Could show a notification to user here
      },
      onOffline: () => {
        console.log('App is now offline');
        // Could show offline indicator
      },
      onOnline: () => {
        console.log('App is back online');
        // Could hide offline indicator
      }
    });
  }, []);

  // Track if this is the initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Update app state when stored settings are loaded - force digital clock only on initial load
  useEffect(() => {
    if (isLoaded) {
      if (isInitialLoad) {
        // On initial page load, always start with digital clock
        setAppState(prev => ({
          ...prev,
          clockEnabled: storedSettings.clockEnabled,
          wallpaperEnabled: false,
          selectedCategories: storedSettings.selectedCategories,
          displayMode: 'digital-clock',
          rotationInterval: storedSettings.rotationInterval,
          timeFormat: storedSettings.timeFormat,
        }));
        
        // Update stored settings to reflect digital clock mode on initial load
        saveSettings({
          ...storedSettings,
          displayMode: 'digital-clock',
          wallpaperEnabled: false
        });
        
        setIsInitialLoad(false);
      } else {
        // On subsequent updates, use the actual stored settings
        setAppState(prev => ({
          ...prev,
          clockEnabled: storedSettings.clockEnabled,
          wallpaperEnabled: storedSettings.wallpaperEnabled,
          selectedCategories: storedSettings.selectedCategories,
          displayMode: storedSettings.displayMode,
          rotationInterval: storedSettings.rotationInterval,
          timeFormat: storedSettings.timeFormat,
        }));
      }
    }
  }, [isLoaded, storedSettings, saveSettings, isInitialLoad]);

  // Update settings button visible state based on mouse activity
  useEffect(() => {
    setAppState(prev => ({
      ...prev,
      settingsVisible: isActive
    }));
  }, [isActive]);

  // Handle settings button click
  const handleSettingsButtonClick = useCallback(() => {
    setSettingsPanelOpen(true);
  }, []);

  // Handle settings panel close
  const handleSettingsPanelClose = useCallback(() => {
    setSettingsPanelOpen(false);
  }, []);

  // Handle settings changes
  const handleSettingsChange = useCallback((newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...storedSettings, ...newSettings };
    
    // Update stored settings
    saveSettings(updatedSettings);
    
    // Update app state immediately for responsive UI
    setAppState(prev => ({
      ...prev,
      clockEnabled: updatedSettings.clockEnabled,
      wallpaperEnabled: updatedSettings.wallpaperEnabled,
      selectedCategories: updatedSettings.selectedCategories,
      displayMode: updatedSettings.displayMode,
      rotationInterval: updatedSettings.rotationInterval,
      timeFormat: updatedSettings.timeFormat,
    }));
  }, [storedSettings, saveSettings]);

  // Determine what to render based on display mode
  const shouldRenderClock = storedSettings.displayMode === 'digital-clock' || storedSettings.displayMode === 'wallpaper';
  const shouldRenderWallpaper = storedSettings.displayMode === 'wallpaper' && storedSettings.wallpaperEnabled;
  const shouldRenderFocusTimer = storedSettings.displayMode === 'focus-mode';
  
  // Clock positioning based on display mode
  const isClockFullScreen = storedSettings.displayMode === 'digital-clock';
  const clockPosition = isClockFullScreen ? 'center' : 'bottom-left';

  // Don't render until settings are loaded to prevent flash of default content
  if (!isLoaded) {
    return (
      <div className="app app-loading">
        <div className="loading-message">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="app app-error">
          <div className="app-error-content">
            <h1>Desktop Clock Error</h1>
            <p>The application encountered an unexpected error and needs to be reloaded.</p>
            <button onClick={() => window.location.reload()}>
              Reload Application
            </button>
          </div>
        </div>
      }
      onError={(error, errorInfo) => {
        console.error('App Error Boundary caught error:', error, errorInfo);
      }}
    >
      <div className={`app ${getAppModeClass(storedSettings.displayMode)}`}>
        {/* Wallpaper component - renders behind everything */}
        {shouldRenderWallpaper && (
          <ErrorBoundary
            fallback={
              <div className="wallpaper-error-fallback">
                <div className="wallpaper-error-message">
                  Wallpaper component failed to load
                </div>
              </div>
            }
          >
            <Wallpaper
              categories={storedSettings.selectedCategories}
              rotationInterval={storedSettings.rotationInterval}
              enabled={true}
            />
          </ErrorBoundary>
        )}

        {/* Clock component - positioned based on display mode */}
        {shouldRenderClock && (
          <ErrorBoundary
            fallback={
              <div className="clock-error-fallback">
                <div className="clock-error-message">
                  Clock component failed to load
                </div>
              </div>
            }
          >
            <Clock
              isFullScreen={isClockFullScreen}
              position={clockPosition}
              timeFormat={storedSettings.timeFormat}
              fontColor={storedSettings.fontColor}
              fontFamily={storedSettings.fontFamily}
            />
          </ErrorBoundary>
        )}

        {/* Focus Timer component - full screen mode */}
        {shouldRenderFocusTimer && (
          <ErrorBoundary
            fallback={
              <div className="focus-timer-error-fallback">
                <div className="focus-timer-error-message">
                  Focus Timer component failed to load
                </div>
              </div>
            }
          >
            <FocusTimer
              fontColor={storedSettings.fontColor}
              fontFamily={storedSettings.fontFamily}
              timeFormat={storedSettings.timeFormat}
            />
          </ErrorBoundary>
        )}

        {/* Settings button - shows on mouse activity */}
        <ErrorBoundary
          fallback={
            <div className="settings-error-fallback">
              Settings button unavailable
            </div>
          }
        >
          <SettingsButton
            isVisible={appState.settingsVisible}
            onClick={handleSettingsButtonClick}
          />
        </ErrorBoundary>

        {/* Settings panel - shows when button is clicked */}
        <ErrorBoundary
          fallback={
            <div className="settings-error-fallback">
              Settings panel unavailable
            </div>
          }
        >
          <Settings
            isVisible={settingsPanelOpen}
            onSettingsChange={handleSettingsChange}
            currentSettings={storedSettings}
            onClose={handleSettingsPanelClose}
          />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

/**
 * Get CSS class for app container based on display mode
 */
function getAppModeClass(displayMode: DisplayMode): string {
  return `app-mode-${displayMode}`;
}

export default App;