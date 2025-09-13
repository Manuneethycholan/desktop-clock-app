import { useState, useEffect, useCallback } from 'react';
import { WallpaperImage } from '../types';
import { getImagesWithFallback, preloadImages } from '../utils/imageLoader';

/**
 * Custom hook for managing wallpaper rotation
 */
export const useWallpaperRotation = (
  categories: string[],
  rotationInterval: number,
  enabled: boolean
) => {
  const [availableImages, setAvailableImages] = useState<WallpaperImage[]>([]);
  const [currentImage, setCurrentImage] = useState<WallpaperImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load images for selected categories
  const loadImages = useCallback(async () => {
    if (categories.length === 0) {
      setAvailableImages([]);
      setCurrentImage(null);
      setCurrentIndex(0);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { images, errors } = await getImagesWithFallback(categories);
      
      if (errors.length > 0) {
        console.warn('Image loading errors:', errors);
      }
      
      if (images.length === 0) {
        const errorMessage = errors.length > 0 
          ? `No valid images found: ${errors.join(', ')}`
          : 'No images found for selected categories';
        console.warn(errorMessage);
        setError(errorMessage);
        setAvailableImages([]);
        setCurrentImage(null);
        setCurrentIndex(0);
      } else {
        setAvailableImages(images);
        
        // Start with a random image instead of the first one
        const randomIndex = Math.floor(Math.random() * images.length);
        setCurrentImage(images[randomIndex]);
        setCurrentIndex(randomIndex);
        
        // Preload a few random images for smooth transitions with error handling
        try {
          const randomImagesToPreload = [];
          for (let i = 0; i < Math.min(3, images.length); i++) {
            const preloadIndex = Math.floor(Math.random() * images.length);
            randomImagesToPreload.push(images[preloadIndex]);
          }
          const validImages = await preloadImages(randomImagesToPreload);
          if (validImages.length < randomImagesToPreload.length) {
            console.warn('Some images failed to preload, but continuing with available images');
          }
        } catch (preloadError) {
          console.warn('Image preloading failed, but continuing with basic loading:', preloadError);
        }
      }
    } catch (err) {
      console.error('Error loading wallpaper images:', err);
      setError(`Failed to load wallpaper images: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setAvailableImages([]);
      setCurrentImage(null);
      setCurrentIndex(0);
    } finally {
      setIsLoading(false);
    }
  }, [categories]);

  // Move to next image with random selection
  const nextImage = useCallback(() => {
    if (availableImages.length === 0) return;
    
    try {
      // Get random image instead of sequential
      const randomIndex = Math.floor(Math.random() * availableImages.length);
      const randomImage = availableImages[randomIndex];
      
      setCurrentImage(randomImage);
      setCurrentIndex(randomIndex);
      
      // Preload a few random images with error handling
      const imagesToPreload = [];
      for (let i = 0; i < 2; i++) {
        const preloadIndex = Math.floor(Math.random() * availableImages.length);
        if (preloadIndex !== randomIndex) {
          imagesToPreload.push(availableImages[preloadIndex]);
        }
      }
      
      // Preload in background without blocking UI
      preloadImages(imagesToPreload).catch(error => {
        console.warn('Background image preloading failed:', error);
      });
    } catch (error) {
      console.error('Error switching to next image:', error);
      // Don't update state if there's an error, keep current image
    }
  }, [availableImages]);

  // Set up rotation interval
  useEffect(() => {
    if (!enabled || availableImages.length <= 1) return;

    const interval = setInterval(nextImage, rotationInterval);
    return () => clearInterval(interval);
  }, [enabled, availableImages.length, rotationInterval, nextImage]);

  // Load images when categories change
  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return {
    currentImage,
    availableImages,
    currentIndex,
    isLoading,
    error,
    nextImage,
    hasImages: availableImages.length > 0,
  };
};