# monowarkayser.com

![Site Preview](preview.png)

My personal portfolio — a space-themed, interactive experience built from scratch. Not your average template site.

**[→ Live Site](https://monowarkayser.com)**

---

## What is this?

This is my portfolio website. I'm MK — a multimedia designer, 3D artist, and lecturer at Daffodil International University. I wanted something that actually represents what I do: immersive 3D work, cinematic motion, and creative storytelling. So I built this instead of picking a Squarespace template.

The site features an interactive 3D rover scene (Perseverance, Draco-compressed and texture-stripped for speed), horizontal scroll transitions, particle systems, a canvas-rendered timeline, and a few other things I thought were cool. The whole thing runs smooth on desktop and gracefully degrades on mobile — no 3D on phones, just clean layouts and swipeable carousels.

## Running locally

```bash
npm install
npm run dev
```

That's it. Vite handles the rest. Opens at `localhost:5173`.

For a production build:

```bash
npm run build
npm run preview
```

## How it's built

The stack is intentionally lean — no React, no Next.js, no framework overhead. Just modules.

- **Vite** for bundling and dev server
- **Three.js** for the 3D scenes (rover viewport, expertise sphere, award particles)
- **GSAP + ScrollTrigger** for all the scroll-driven animations and transitions
- **Lenis** for that buttery smooth scroll feel
- **Tailwind CSS** for styling
- **Vanilla JS (ES6 modules)** for everything else

Heavy stuff like the rover scene, teaching sphere, and particle systems are code-split into separate chunks and lazy-loaded where it makes sense. The rover model itself is a Draco-compressed GLTF with embedded textures stripped out (we apply our own materials in code anyway), bringing it down from ~7.5MB to ~1.3MB.

## Project layout

```
src/
├── main.js                  # entry point, orchestrates everything
├── rover-scene.js           # Three.js perseverance rover viewport
├── spotlight-interaction.js # rover UI overlay (mode switching, HUD)
├── teaching-areas.js        # 3D expertise tag sphere
├── tree-timeline.js         # canvas-based journey timeline
├── awards-particles.js      # floating particles on awards section
├── scroll-animations.js     # GSAP scroll-driven transitions
├── performance-manager.js   # adapts quality based on device capability
├── data.js                  # content data (journey, expertise tags)
├── style.css                # base styles + tailwind
└── ...                      # cursor effects, nav, tilt, etc.

public/
├── models/perseverance/     # draco-compressed rover model
├── draco/                   # WASM decoder for draco
├── images/                  # project thumbnails, profile photo
└── ...                      # manifest, sitemap, robots.txt
```

## Deployment

Currently hosted on **Netlify**. The `netlify.toml` in the root handles build config, redirects, caching headers, and security headers automatically. Just push to `main`.

There's also a GitHub Actions workflow (`.github/workflows/deploy.yml`) if you ever want to use GitHub Pages instead.

## Notes

- Needs **Node 20+** to build
- The rover model uses Draco compression — the WASM decoder lives in `public/draco/`
- PWA-ready with auto-updating service worker (via `vite-plugin-pwa`)
- On mobile, 3D scenes are skipped entirely to keep things fast. The teaching section becomes a horizontal card carousel, and the rover section just doesn't render.

---

Built by **S M Monowar Kayser** · [monowarkayser.com](https://monowarkayser.com)
