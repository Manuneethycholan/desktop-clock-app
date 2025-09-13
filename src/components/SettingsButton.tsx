import React from 'react';
import '../styles/SettingsButton.css';

interface SettingsButtonProps {
  isVisible: boolean;
  onClick: () => void;
}

/**
 * Settings button that appears on mouse movement
 */
const SettingsButton: React.FC<SettingsButtonProps> = ({ isVisible, onClick }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <button 
      className="settings-button"
      onClick={onClick}
      aria-label="Open Settings"
    >
      ⚙️
    </button>
  );
};

export default SettingsButton;