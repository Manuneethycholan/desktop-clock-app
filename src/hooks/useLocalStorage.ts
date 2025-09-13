import { useState, useEffect, useCallback } from 'react';
import { StoredSettings, AppSettings } from '../types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '../utils/constants';

/**
 * Custom hook for managing localStorage with settings persistence
 * Handles validation, migration, and error recovery
 */
export const useLocalStorage = () => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Validate stored settings structure
  const validateSettings = (data: any): data is StoredSettings => {
    if (!data || typeof data !== 'object') return false;
    
    const requiredFields = [
      'version',
      'clockEnabled',
      'wallpaperEnabled',
      'selectedCategories',
      'rotationInterval',
      'timeFormat',
      'fontColor',
      'fontFamily',
      'lastUpdated'
    ];

    // displayMode is optional for backward compatibility
    return requiredFields.every(field => field in data);
  };

  // Convert stored settings to app settings
  const convertStoredToAppSettings = (stored: StoredSettings): AppSettings => {
    return {
      clockEnabled: stored.clockEnabled,
      wallpaperEnabled: stored.wallpaperEnabled,
      selectedCategories: stored.selectedCategories,
      rotationInterval: stored.rotationInterval,
      timeFormat: stored.timeFormat,
      fontColor: stored.fontColor || DEFAULT_SETTINGS.fontColor,
      fontFamily: stored.fontFamily || DEFAULT_SETTINGS.fontFamily,
      displayMode: stored.displayMode || DEFAULT_SETTINGS.displayMode,
    };
  };

  // Convert app settings to stored settings
  const convertAppToStoredSettings = (appSettings: AppSettings): StoredSettings => {
    return {
      version: STORAGE_KEYS.VERSION,
      clockEnabled: appSettings.clockEnabled,
      wallpaperEnabled: appSettings.wallpaperEnabled,
      selectedCategories: appSettings.selectedCategories,
      rotationInterval: appSettings.rotationInterval,
      timeFormat: appSettings.timeFormat,
      fontColor: appSettings.fontColor,
      fontFamily: appSettings.fontFamily,
      displayMode: appSettings.displayMode,
      lastUpdated: new Date().toISOString(),
    };
  };

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      
      if (!stored) {
        console.log('No stored settings found, using defaults');
        setSettings(DEFAULT_SETTINGS);
        setIsLoaded(true);
        return;
      }

      const parsedData = JSON.parse(stored);
      
      if (!validateSettings(parsedData)) {
        console.warn('Invalid stored settings format, using defaults');
        setSettings(DEFAULT_SETTINGS);
        setIsLoaded(true);
        return;
      }

      // Check version for potential migration
      if (parsedData.version !== STORAGE_KEYS.VERSION) {
        console.log('Settings version mismatch, migrating...');
        // For now, just use defaults. Future versions can implement migration logic
        setSettings(DEFAULT_SETTINGS);
        setIsLoaded(true);
        return;
      }

      const appSettings = convertStoredToAppSettings(parsedData);
      setSettings(appSettings);
      setIsLoaded(true);
      console.log('Settings loaded successfully');
      
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AppSettings) => {
    try {
      const storedSettings = convertAppToStoredSettings(newSettings);
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(storedSettings));
      setSettings(newSettings);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings to localStorage:', error);
      // Still update in-memory settings even if localStorage fails
      setSettings(newSettings);
    }
  }, []);

  // Update specific setting
  const updateSetting = useCallback(<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  }, [settings, saveSettings]);

  // Reset to default settings
  const resetSettings = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      setSettings(DEFAULT_SETTINGS);
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Error resetting settings:', error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, []);

  // Check if localStorage is available
  const isLocalStorageAvailable = useCallback(() => {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Load settings on mount
  useEffect(() => {
    if (!isLocalStorageAvailable()) {
      console.warn('localStorage not available, using in-memory settings');
      setSettings(DEFAULT_SETTINGS);
      setIsLoaded(true);
      return;
    }

    loadSettings();
  }, [loadSettings, isLocalStorageAvailable]);

  return {
    settings,
    isLoaded,
    saveSettings,
    updateSetting,
    resetSettings,
    isLocalStorageAvailable: isLocalStorageAvailable(),
  };
};