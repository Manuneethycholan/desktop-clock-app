# Desktop Clock App 🕐

A beautiful, customizable desktop clock application with rotating wallpapers, focus timer, and offline support. Built with React and TypeScript.

## ✨ Features

- **Beautiful Clock Display**: Clean, modern clock with customizable formats
- **Dynamic Wallpapers**: Rotating background images from multiple categories
- **Focus Timer**: Built-in Pomodoro timer for productivity
- **Offline Support**: Works without internet connection via service worker
- **Responsive Design**: Adapts to different screen sizes
- **Performance Optimized**: Lazy loading, image optimization, and efficient caching

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/desktop-clock-app.git
cd desktop-clock-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🖼️ Adding Your Own Wallpapers

### Step 1: Add Images to Categories

Navigate to the wallpapers directory and add your images to the appropriate category:

```bash
cd public/wallpapers
```

Available categories:
- `ai/` - AI-generated images
- `anime/` - Anime wallpapers
- `automobile/` - Car and vehicle images
- `common_mass/` - General/popular images
- `kamal/` - Kamal-themed images
- `motivational/` - Inspirational quotes and images
- `nature/` - Natural landscapes and scenery
- `rajini/` - Rajini-themed images
- `random/` - Miscellaneous images
- `spiritual/` - Spiritual and religious images
- `tech/` - Technology-themed images

### Step 2: Optimize Images (Recommended)

For better performance, optimize your images:

```bash
# Install optimization tools (macOS)
brew install imagemagick webp

# Run optimization analysis
npm run optimize
```

This will identify large images and provide optimization commands.

### Step 3: Generate Image Manifest

After adding new images, regenerate the manifest:

```bash
npm run generate-manifest
```

This creates a JSON file that the app uses to load wallpapers efficiently.

## 🔧 Build and Deploy

### Local Production Build

```bash
# Create optimized production build
npm run build

# Serve locally to test
npm run serve
```

### Deploy to GitHub Pages

1. **Update package.json**: Replace `YOUR_GITHUB_USERNAME` with your GitHub username:

```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/desktop-clock-app"
```

2. **Deploy**:

```bash
npm run deploy
```

3. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages section
   - Select "Deploy from a branch"
   - Choose `gh-pages` branch

### Alternative Deployment Options

**Netlify**:
```bash
# Build the project
npm run build

# Deploy the 'build' folder to Netlify
```

**Vercel**:
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 📁 Project Structure

```
desktop-clock-app/
├── public/
│   ├── wallpapers/          # Wallpaper categories
│   ├── index.html
│   ├── manifest.json        # PWA manifest
│   └── sw.js               # Service worker
├── src/
│   ├── components/         # React components
│   │   ├── App.tsx
│   │   ├── Clock.tsx
│   │   ├── FocusTimer.tsx
│   │   ├── Settings.tsx
│   │   └── Wallpaper.tsx
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # CSS styles
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
├── scripts/               # Build scripts
│   ├── generateImageManifest.js
│   ├── optimizeImages.js
│   └── postBuild.js
└── package.json
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Create production build |
| `npm run deploy` | Deploy to GitHub Pages |
| `npm run generate-manifest` | Generate wallpaper manifest |
| `npm run optimize` | Analyze image optimization |
| `npm run analyze` | Analyze bundle size |
| `npm run serve` | Serve production build locally |
| `npm test` | Run tests |

## ⚡ Performance Features

- **Lazy Loading**: Images load efficiently in batches
- **Service Worker**: Offline caching and background sync
- **Bundle Optimization**: Code splitting and minification
- **Image Optimization**: Automatic compression recommendations
- **Memory Management**: Efficient image preloading

## 🎨 Customization

### Adding New Wallpaper Categories

1. Create a new folder in `public/wallpapers/`
2. Add images to the folder
3. Run `npm run generate-manifest`
4. The new category will appear in settings

### Modifying Clock Appearance

Edit `src/components/Clock.tsx` to customize:
- Time format (12/24 hour)
- Font styles
- Colors and animations

### Changing Timer Settings

Modify `src/components/FocusTimer.tsx` for:
- Default timer durations
- Sound notifications
- Visual indicators

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Images Not Loading

1. Check image file formats (JPG, PNG, WebP supported)
2. Ensure images are in correct wallpaper folders
3. Run `npm run generate-manifest` after adding images
4. Check browser console for errors

### Deployment Issues

1. Verify GitHub Pages is enabled
2. Check `homepage` URL in package.json
3. Ensure `gh-pages` branch exists
4. Review GitHub Actions logs (if using CI/CD)

## 📊 Performance Monitoring

### Bundle Analysis

```bash
npm run analyze
```

### Optimization Reports

After building, check:
- `build/build-report.json` - Build metrics
- `optimization-report.json` - Image optimization suggestions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Enjoy Your Desktop Clock!

Once deployed, you can:
- Set it as your browser homepage
- Use it as a screensaver
- Pin it as a desktop app (PWA)
- Customize wallpapers to match your style

Happy coding! ⏰✨