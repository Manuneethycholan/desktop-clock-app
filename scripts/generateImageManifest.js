const fs = require('fs');
const path = require('path');

/**
 * Script to generate image manifest from wallpaper directories
 * This will be run during build to create a list of available images
 */

const WALLPAPERS_DIR = path.join(__dirname, '../public/wallpapers');
const OUTPUT_FILE = path.join(__dirname, '../src/data/imageManifest.json');

// Supported image extensions
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

/**
 * Check if file is an image
 */
function isImageFile(filename) {
  const ext = path.extname(filename).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
}

/**
 * Recursively get all images in a directory and its subdirectories
 */
function getImagesInDirectory(dirPath, relativePath = '') {
  const images = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    items.forEach(item => {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && !item.startsWith('.')) {
        // Recursively scan subdirectory
        const subDirRelativePath = relativePath ? `${relativePath}/${item}` : item;
        const subDirImages = getImagesInDirectory(itemPath, subDirRelativePath);
        images.push(...subDirImages);
      } else if (stat.isFile() && isImageFile(item)) {
        // Add image with relative path
        const imageRelativePath = relativePath ? `${relativePath}/${item}` : item;
        images.push(imageRelativePath);
      }
    });
    
    return images;
  } catch (error) {
    console.warn(`Could not read directory ${dirPath}:`, error.message);
    return [];
  }
}

/**
 * Update constants file with actual image counts
 */
function updateConstantsFile(manifest) {
  const constantsPath = path.join(__dirname, '../src/utils/constants.ts');
  
  try {
    let constantsContent = fs.readFileSync(constantsPath, 'utf8');
    
    // Update each category's image count
    Object.entries(manifest).forEach(([categoryName, images]) => {
      const imageCount = images.length;
      const regex = new RegExp(
        `(\\{\\s*name:\\s*'${categoryName}'[^}]*imageCount:\\s*)\\d+(\\s*[^}]*\\})`,
        'g'
      );
      
      constantsContent = constantsContent.replace(regex, `$1${imageCount}$2`);
    });
    
    fs.writeFileSync(constantsPath, constantsContent);
    console.log('Updated constants file with actual image counts');
  } catch (error) {
    console.warn('Could not update constants file:', error.message);
  }
}

/**
 * Generate image manifest
 */
function generateImageManifest() {
  const manifest = {};
  
  try {
    // Get all category directories
    const categories = fs.readdirSync(WALLPAPERS_DIR).filter(item => {
      const itemPath = path.join(WALLPAPERS_DIR, item);
      const stat = fs.statSync(itemPath);
      return stat.isDirectory() && !item.startsWith('.');
    });

    // Process each category
    categories.forEach(category => {
      const categoryPath = path.join(WALLPAPERS_DIR, category);
      const images = getImagesInDirectory(categoryPath);
      
      manifest[category] = images;
      console.log(`Found ${images.length} images in ${category} category`);
      
      // Log subdirectory structure for debugging
      if (images.length > 0) {
        const subdirs = new Set();
        const rootImages = [];
        images.forEach(img => {
          const dir = path.dirname(img);
          if (dir !== '.') {
            subdirs.add(dir);
          } else {
            rootImages.push(img);
          }
        });
        
        if (subdirs.size > 0) {
          console.log(`  Subdirectories: ${Array.from(subdirs).join(', ')}`);
          console.log(`  Root images: ${rootImages.length}, Subfolder images: ${images.length - rootImages.length}`);
        }
      }
    });

    // Ensure output directory exists
    const outputDir = path.dirname(OUTPUT_FILE);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write manifest file
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`Image manifest generated successfully at ${OUTPUT_FILE}`);
    
    // Update constants file with actual image counts
    updateConstantsFile(manifest);
    
    // Log summary
    const totalImages = Object.values(manifest).reduce((sum, images) => sum + images.length, 0);
    console.log(`Total categories: ${categories.length}`);
    console.log(`Total images: ${totalImages}`);
    
  } catch (error) {
    console.error('Error generating image manifest:', error);
    process.exit(1);
  }
}

// Run the script
generateImageManifest();