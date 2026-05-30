# S M Monowar Kayser | 3D & Multimedia Portfolio

A high-performance, immersive 3D portfolio website showcasing the work of S M Monowar Kayser. Built with modern web technologies to deliver a premium, cinematic experience.

## 🚀 Tech Stack

- **Framework:** Vanilla JS (Modular ES6+)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **3D Graphics:** [Three.js](https://threejs.org/)
- **Animations:** [GSAP](https://greensock.com/gsap/) (ScrollTrigger)
- **Smooth Scroll:** [Lenis](https://github.com/studio-freight/lenis)

## 🛠 Features

- **3D Transitions:** Seamless camera transitions between standard DOM content and 3D scenes (Spotlight Rover).
- **Procedural Art:** 3D particles, starfields, and a procedural rover generated in real-time.
- **Expertise Sphere:** Interactive 3D tag cloud for teaching areas.
- **Tree Timeline:** Canvas-based animated journey/experience timeline.
- **Performance Optimized:**
    - Lazy loading for images and heavy 3D modules.
    - Dynamic imports for `rover-scene.js`, `teaching-areas.js`, `awards-particles.js`, `tree-timeline.js`.
    - Optimized asset delivery (WebP images, Draco-compressed 3D models).
    - Code splitting with manual chunks for vendor libraries.
- **PWA Ready:** Configured with `vite-plugin-pwa` for offline capability and installability.
- **Responsive:** Fully adaptive layout with mobile-specific optimizations (carousel views, reduced 3D overhead).

## 📦 Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Pages CI/CD
├── public/
│   ├── draco/               # Draco decoder (WASM)
│   ├── images/              # Static images (WebP, SVG, MP4)
│   ├── models/              # 3D models (GLTF + textures)
│   ├── robots.txt
│   ├── site.webmanifest
│   └── sitemap.xml
├── src/
│   ├── assets/fonts/        # Custom fonts
│   ├── main.js              # Entry point & orchestration
│   ├── rover-scene.js       # Three.js rover scene
│   ├── spotlight-interaction.js  # 3D spotlight UI
│   ├── teaching-areas.js    # 3D expertise sphere
│   ├── tree-timeline.js     # Canvas timeline
│   ├── awards-particles.js  # Awards section particles
│   ├── scroll-animations.js # GSAP scroll animations
│   ├── animations.js        # Global GSAP animations
│   ├── performance-manager.js # Adaptive performance
│   ├── data.js              # Centralized content data
│   ├── style.css            # Tailwind directives & custom CSS
│   └── ...                  # Other modules
├── index.html               # Main markup
├── 404.html                 # Custom 404 page
├── vite.config.js           # Build configuration
├── tailwind.config.js       # Tailwind theme
└── package.json
```

## 🔧 Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

## 🚀 Deployment (GitHub Pages)

This project is configured for automatic deployment via GitHub Actions.

### Automatic Deployment
1. Push to the `main` branch.
2. The GitHub Actions workflow (`.github/workflows/deploy.yml`) will:
   - Install dependencies
   - Build the project with Vite
   - Deploy the `dist/` folder to GitHub Pages

### GitHub Setup
1. Go to your repository **Settings → Pages**.
2. Under **Source**, select **GitHub Actions**.
3. Push to `main` — the workflow will handle the rest.

### Manual Deployment
```bash
npm run build
# Upload the contents of `dist/` to your hosting provider
```

## 📋 Environment Notes

- **Node.js 20+** recommended
- **3D Models:** Perseverance rover model uses Draco compression (WASM decoder included in `public/draco/`)
- **PWA:** Service worker auto-updates on new deployments

---

**Designed & Developed by Munasib Apurbo**
