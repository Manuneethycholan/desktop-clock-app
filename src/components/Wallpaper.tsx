import React from 'react';
import { WallpaperProps } from '../types';
import { useWallpaperRotation } from '../hooks/useWallpaperRotation';
import { CSS_CLASSES } from '../utils/constants';
import '../styles/Wallpaper.css';

/**
 * Wallpaper component that displays rotating background images
 * with CSS-based scaling (small/medium/large)
 */
const Wallpaper: React.FC<WallpaperProps> = ({
  categories,
  rotationInterval,
  enabled
}) => {
  const {
    currentImage,
    isLoading,
    error,
    hasImages
  } = useWallpaperRotation(categories, rotationInterval, enabled);

  // Don't render anything if wallpapers are disabled
  if (!enabled) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className={`${CSS_CLASSES.WALLPAPER_CONTAINER} wallpaper-loading`}>
        <div className="wallpaper-loading-text">Loading wallpapers...</div>
      </div>
    );
  }

  // Show error state with fallback background
  if (error) {
    return (
      <div className={`${CSS_CLASSES.WALLPAPER_CONTAINER} wallpaper-error`}>
        <div className="wallpaper-error-overlay">
          <div className="wallpaper-error-text">
            <h3>Wallpaper Error</h3>
            <p>{error}</p>
            <small>Using default background</small>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state when no images are available
  if (!hasImages || !currentImage) {
    return (
      <div className={`${CSS_CLASSES.WALLPAPER_CONTAINER} wallpaper-empty`}>
        {/* Black background when no wallpapers are selected */}
        <div className="wallpaper-empty-overlay">
          <div className="wallpaper-empty-text">
            {categories.length === 0 
              ? "No wallpaper categories selected" 
              : "No images found in selected categories"
            }
          </div>
        </div>
      </div>
    );
  }

  // Render wallpaper with current image and error handling
  return (
    <div className={CSS_CLASSES.WALLPAPER_CONTAINER}>
      <div
        className={CSS_CLASSES.WALLPAPER_IMAGE}
        style={{
          backgroundImage: `url(${currentImage.src})`,
        }}
        aria-label={`Wallpaper from ${currentImage.category} category`}
        onError={(e) => {
          console.error('Wallpaper image failed to load:', currentImage.src);
          // Set fallback background
          const target = e.target as HTMLElement;
          target.style.backgroundImage = 'none';
          target.style.backgroundColor = '#1a1a1a';
        }}
      />
      
      {/* Fallback overlay for broken images */}
      <div 
        className="wallpaper-image-fallback"
        style={{
          backgroundImage: `url(${currentImage.src})`,
        }}
        onError={(e) => {
          const target = e.target as HTMLElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
};

export default Wallpaper;