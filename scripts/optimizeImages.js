const fs = require('fs');
const path = require('path');

/**
 * Image optimization script for wallpapers
 * This script provides guidance and utilities for optimizing images
 */

const WALLPAPER_DIR = path.join(__dirname, '../public/wallpapers');
const MAX_FILE_SIZE = 500 * 1024; // 500KB recommended max
const RECOMMENDED_DIMENSIONS = {
  width: 1920,
  height: 1080
};

/**
 * Analyze current image sizes and provide optimization recommendations
 */
function analyzeImages() {
  console.log('🔍 Analyzing wallpaper images...\n');
  
  const categories = fs.readdirSync(WALLPAPER_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  let totalSize = 0;
  let totalFiles = 0;
  const largeFiles = [];
  const recommendations = [];
  
  categories.forEach(category => {
    const categoryPath = path.join(WALLPAPER_DIR, category);
    
    if (!fs.existsSync(categoryPath)) return;
    
    const files = fs.readdirSync(categoryPath)
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    
    console.log(`📁 ${category}: ${files.length} images`);
    
    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      totalSize += stats.size;
      totalFiles++;
      
      if (stats.size > MAX_FILE_SIZE) {
        largeFiles.push({
          path: path.relative(WALLPAPER_DIR, filePath),
          size: sizeKB,
          category
        });
      }
      
      console.log(`  📄 ${file}: ${sizeKB}KB`);
    });
    
    console.log('');
  });
  
  console.log(`📊 Summary:`);
  console.log(`  Total files: ${totalFiles}`);
  console.log(`  Total size: ${Math.round(totalSize / 1024 / 1024)}MB`);
  console.log(`  Average size: ${Math.round(totalSize / totalFiles / 1024)}KB per file\n`);
  
  if (largeFiles.length > 0) {
    console.log(`⚠️  Large files (>${Math.round(MAX_FILE_SIZE / 1024)}KB):`);
    largeFiles.forEach(file => {
      console.log(`  📄 ${file.path}: ${file.size}KB`);
    });
    console.log('');
    
    recommendations.push('Consider compressing large images to reduce load times');
    recommendations.push('Use tools like ImageOptim, TinyPNG, or online compressors');
    recommendations.push('Convert PNG files to JPG if transparency is not needed');
    recommendations.push('Consider WebP format for better compression');
  }
  
  if (recommendations.length > 0) {
    console.log('💡 Optimization Recommendations:');
    recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    console.log('');
  }
  
  // Generate optimization commands
  console.log('🛠️  Optimization Commands (manual execution required):');
  console.log('');
  console.log('# Using ImageMagick (install with: brew install imagemagick)');
  console.log('# Compress and resize images:');
  largeFiles.forEach(file => {
    const inputPath = path.join('public/wallpapers', file.path);
    console.log(`magick "${inputPath}" -quality 85 -resize 1920x1080> "${inputPath}"`);
  });
  
  console.log('');
  console.log('# Using cwebp for WebP conversion (install with: brew install webp)');
  console.log('# Convert to WebP format:');
  largeFiles.forEach(file => {
    const inputPath = path.join('public/wallpapers', file.path);
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    console.log(`cwebp -q 85 "${inputPath}" -o "${outputPath}"`);
  });
  
  console.log('');
  console.log('📝 Note: Run these commands manually in the desktop-clock-app directory');
  console.log('📝 After optimization, update imageManifest.json with new filenames');
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
  const report = {
    timestamp: new Date().toISOString(),
    analysis: 'Image optimization analysis completed',
    recommendations: [
      'Compress images larger than 500KB',
      'Use WebP format where supported',
      'Implement lazy loading for better performance',
      'Consider progressive JPEG for large images'
    ],
    tools: [
      'ImageMagick: brew install imagemagick',
      'WebP tools: brew install webp',
      'Online tools: TinyPNG, ImageOptim'
    ]
  };
  
  const reportPath = path.join(__dirname, '../optimization-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Performance report saved to: ${reportPath}`);
}

// Run analysis
if (require.main === module) {
  analyzeImages();
  generatePerformanceReport();
}

module.exports = {
  analyzeImages,
  generatePerformanceReport,
  MAX_FILE_SIZE,
  RECOMMENDED_DIMENSIONS
};