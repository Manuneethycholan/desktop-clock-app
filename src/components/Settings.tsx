import React, { useState, useEffect, useRef } from 'react';
import { SettingsProps, TimeFormat, FontColor, FontFamily } from '../types';
import { WALLPAPER_CATEGORIES, ROTATION_INTERVALS, CSS_CLASSES, FONT_COLORS, FONT_FAMILIES } from '../utils/constants';
import { getCategoryDisplayName } from '../utils/imageLoader';
import '../styles/Settings.css';

/**
 * Settings component with dropdown sections for Digital Clock and Wallpaper settings
 */
const Settings: React.FC<SettingsProps> = ({
  isVisible,
  onSettingsChange,
  currentSettings,
  onClose
}) => {
  const [digitalClockExpanded, setDigitalClockExpanded] = useState(false);
  const [wallpaperExpanded, setWallpaperExpanded] = useState(false);
  const autoCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  // Auto-close after 7 seconds of inactivity
  useEffect(() => {
    if (!isVisible) return;

    const resetAutoCloseTimer = () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }

      autoCloseTimeoutRef.current = setTimeout(() => {
        if (onClose) {
          onClose();
        }
      }, 7000); // 7 seconds
    };

    // Start the timer when panel opens
    resetAutoCloseTimer();

    // Reset timer on any interaction within the settings panel
    const handleInteraction = () => {
      resetAutoCloseTimer();
    };

    const panelElement = settingsPanelRef.current;
    if (panelElement) {
      panelElement.addEventListener('mouseenter', handleInteraction);
      panelElement.addEventListener('mousemove', handleInteraction);
      panelElement.addEventListener('click', handleInteraction);
      panelElement.addEventListener('scroll', handleInteraction);
    }

    // Cleanup
    return () => {
      if (autoCloseTimeoutRef.current) {
        clearTimeout(autoCloseTimeoutRef.current);
      }
      if (panelElement) {
        panelElement.removeEventListener('mouseenter', handleInteraction);
        panelElement.removeEventListener('mousemove', handleInteraction);
        panelElement.removeEventListener('click', handleInteraction);
        panelElement.removeEventListener('scroll', handleInteraction);
      }
    };
  }, [isVisible, onClose]);



  // Handle category selection with edge case handling
  const handleCategoryToggle = (category: string, selected: boolean) => {
    let updatedCategories: string[];

    if (selected) {
      // Add category if not already present
      updatedCategories = currentSettings.selectedCategories.includes(category)
        ? currentSettings.selectedCategories
        : [...currentSettings.selectedCategories, category];
    } else {
      // Remove category
      updatedCategories = currentSettings.selectedCategories.filter(cat => cat !== category);
    }

    onSettingsChange({ selectedCategories: updatedCategories });
  };

  // Check if no categories are selected
  const hasNoCategories = currentSettings.selectedCategories.length === 0;



  // Handle rotation interval change
  const handleRotationIntervalChange = (interval: number) => {
    onSettingsChange({ rotationInterval: interval });
  };

  // Handle time format change
  const handleTimeFormatChange = (format: TimeFormat) => {
    onSettingsChange({ timeFormat: format });
  };

  // Handle font color change
  const handleFontColorChange = (color: FontColor) => {
    onSettingsChange({ fontColor: color });
  };

  // Handle font family change
  const handleFontFamilyChange = (family: FontFamily) => {
    onSettingsChange({ fontFamily: family });
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={settingsPanelRef}
      className={`${CSS_CLASSES.SETTINGS_PANEL} ${CSS_CLASSES.SETTINGS_VISIBLE}`}
    >
      <div className="settings-content">
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button
            className="settings-close-button"
            onClick={onClose}
            aria-label="Close Settings"
          >
            ✕
          </button>
        </div>

        {/* Display Mode Controls */}
        <div className="settings-section">
          <h3 className="settings-section-title">Display Mode</h3>

          <div className="settings-toggle-group">
            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={currentSettings.wallpaperEnabled}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    // If wallpaper is being enabled, disable focus mode and enable wallpaper
                    onSettingsChange({
                      wallpaperEnabled: true,
                      displayMode: 'wallpaper'
                    });
                  } else {
                    // If wallpaper is being disabled, switch to digital clock
                    onSettingsChange({
                      wallpaperEnabled: false,
                      displayMode: 'digital-clock'
                    });
                  }
                }}
              />
              <span className="settings-toggle-label">Show Wallpapers</span>
            </label>

            <label className="settings-toggle">
              <input
                type="checkbox"
                checked={currentSettings.displayMode === 'focus-mode'}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  if (e.target.checked) {
                    // If focus mode is being enabled, disable wallpaper and enable focus mode
                    onSettingsChange({
                      wallpaperEnabled: false,
                      displayMode: 'focus-mode'
                    });
                  } else {
                    // If focus mode is being disabled, switch to digital clock
                    onSettingsChange({
                      displayMode: 'digital-clock'
                    });
                  }
                }}
              />
              <span className="settings-toggle-label">Focus Mode</span>
            </label>
          </div>
        </div>

        {/* Digital Clock Settings Dropdown */}
        <div className="settings-dropdown">
          <button
            className={`settings-dropdown-header ${digitalClockExpanded ? 'expanded' : ''}`}
            onClick={() => setDigitalClockExpanded(!digitalClockExpanded)}
          >
            <span>Digital Clock Settings</span>
            <span className="dropdown-arrow">{digitalClockExpanded ? '▼' : '▶'}</span>
          </button>

          {digitalClockExpanded && (
            <div className="settings-dropdown-content">
              {/* Time Format */}
              <div className="settings-subsection">
                <h4 className="settings-subsection-title">Time Format</h4>
                <div className="settings-radio-group">
                  <label className="settings-radio">
                    <input
                      type="radio"
                      name="timeFormat"
                      value="12h"
                      checked={currentSettings.timeFormat === '12h'}
                      onChange={() => handleTimeFormatChange('12h')}
                    />
                    <span className="settings-radio-label">12 Hour</span>
                  </label>

                  <label className="settings-radio">
                    <input
                      type="radio"
                      name="timeFormat"
                      value="24h"
                      checked={currentSettings.timeFormat === '24h'}
                      onChange={() => handleTimeFormatChange('24h')}
                    />
                    <span className="settings-radio-label">24 Hour</span>
                  </label>
                </div>
              </div>

              {/* Font Color */}
              <div className="settings-subsection">
                <h4 className="settings-subsection-title">Font Color</h4>
                <div className="settings-color-grid">
                  {FONT_COLORS.map(color => (
                    <label key={color.value} className="settings-color-option">
                      <input
                        type="radio"
                        name="fontColor"
                        value={color.value}
                        checked={currentSettings.fontColor === color.value}
                        onChange={() => handleFontColorChange(color.value)}
                      />
                      <span
                        className="settings-color-swatch"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                      <span className="settings-color-name">{color.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Font Family */}
              <div className="settings-subsection">
                <h4 className="settings-subsection-title">Font Type</h4>
                <select
                  className="settings-select"
                  value={currentSettings.fontFamily}
                  onChange={(e) => handleFontFamilyChange(e.target.value)}
                >
                  {FONT_FAMILIES.map(font => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Wallpaper Settings Dropdown */}
        {currentSettings.wallpaperEnabled && (
          <div className="settings-dropdown">
            <button
              className={`settings-dropdown-header ${wallpaperExpanded ? 'expanded' : ''}`}
              onClick={() => setWallpaperExpanded(!wallpaperExpanded)}
            >
              <span>Wallpaper Settings</span>
              <span className="dropdown-arrow">{wallpaperExpanded ? '▼' : '▶'}</span>
            </button>

            {wallpaperExpanded && (
              <div className="settings-dropdown-content">


                {/* Rotation Speed */}
                <div className="settings-subsection">
                  <h4 className="settings-subsection-title">Rotation Speed</h4>
                  <select
                    className="settings-select"
                    value={currentSettings.rotationInterval}
                    onChange={(e) => handleRotationIntervalChange(Number(e.target.value))}
                  >
                    {ROTATION_INTERVALS.map(interval => (
                      <option key={interval.value} value={interval.value}>
                        {interval.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Selection */}
                <div className="settings-subsection">
                  <h4 className="settings-subsection-title">Wallpaper Categories</h4>

                  <div className="settings-category-grid">
                    {WALLPAPER_CATEGORIES.map(category => {
                      const isSelected = currentSettings.selectedCategories.includes(category.name);
                      const hasImages = category.imageCount > 0;
                      const categoryClass = `settings-category ${isSelected ? 'category-selected' : 'category-unselected'
                        } ${!hasImages ? 'category-empty' : ''}`;

                      return (
                        <label key={category.name} className={categoryClass}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleCategoryToggle(category.name, e.target.checked)}
                            aria-label={`Toggle ${getCategoryDisplayName(category.name)} wallpapers${!hasImages ? ' (no images available)' : ''}`}
                            disabled={!hasImages}
                          />
                          <span className="settings-category-label">
                            {getCategoryDisplayName(category.name)}
                            {hasImages && category.imageCount > 0 && (
                              <span className="settings-category-count">
                                ({category.imageCount})
                              </span>
                            )}
                            {!hasImages && (
                              <span className="settings-category-empty-indicator">
                                (empty)
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Warning when no categories are selected */}
                  {hasNoCategories && (
                    <div className="settings-category-warning">
                      No categories selected. A black background will be displayed.
                    </div>
                  )}

                  {/* Info about selected categories */}
                  {currentSettings.selectedCategories.length > 0 && (
                    <div className="settings-category-info">
                      {currentSettings.selectedCategories.length} categor{currentSettings.selectedCategories.length === 1 ? 'y' : 'ies'} selected
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;