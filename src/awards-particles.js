import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    BufferGeometry,
    BufferAttribute,
    PointsMaterial,
    Points,
    AdditiveBlending
} from 'three';

import { performanceManager } from './performance-manager.js';

gsap.registerPlugin(ScrollTrigger);

export function initAwardsParticles() {
    const canvas = document.getElementById('awards-canvas-webgl');
    if (!canvas) return;

    const scene = new Scene();
    const camera = new PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    const renderer = new WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
    renderer.setPixelRatio(performanceManager.mode === 'EFFICIENCY' ? 1 : Math.min(window.devicePixelRatio, 1.5));

    const width = window.innerWidth;
    const isMobile = width < 768;

    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    // Dynamic Particle Count
    const getParticleCount = () => {
        if (performanceManager.mode === 'EFFICIENCY') {
            return 200;
        }
        return window.innerWidth < 768 ? 600 : 1000;
    };

    let particleCount = getParticleCount();

    // We'll allocate max buffers but only draw what we need or just re-allocate on resize?
    // Better to allocate max reasonable amount to avoid re-allocating buffers constantly
    // Let's stick to a safe max for buffers and draw range, or just fixed reasonable max.
    const maxParticles = 2000;

    const geometry = new BufferGeometry();
    const positions = new Float32Array(maxParticles * 3);
    const randomPositions = new Float32Array(maxParticles * 3);
    const trophyPositions = new Float32Array(maxParticles * 3);

    // Listener for robust updates. onChange fires immediately, so geometry must exist first.
    performanceManager.onChange(() => {
        particleCount = getParticleCount();
        geometry.setDrawRange(0, particleCount);
    });

    // Initialize all Arrays (we'll only use 'particleCount' of them)
    function initPositions() {
        // Generate Random Positions (Scattered)
        for (let i = 0; i < maxParticles; i++) {
            randomPositions[i * 3] = (Math.random() - 0.5) * 20;
            randomPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            randomPositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }

        // Generate Trophy Positions (Refined Modern Trophy - Scaled Up)
        for (let i = 0; i < maxParticles; i++) {
            const part = Math.random();
            let x, y, z;

            if (part < 0.15) {
                // BASE (Cylindrical tiers)
                const tier = Math.random();
                const r = (tier < 0.5) ? 1.5 : 1.0;
                const theta = Math.random() * Math.PI * 2;
                const radius = Math.sqrt(Math.random()) * r;
                y = -3.5 + Math.random() * 0.6;
                x = radius * Math.cos(theta);
                z = radius * Math.sin(theta);
            } else {
                // BODY (Elegant twisted spire)
                const h = Math.random();
                y = -3.0 + h * 7.0;

                const widthProfile = 0.6 + Math.pow(h, 1.5) * 2.2;

                const strand = Math.floor(Math.random() * 3);
                const strandOffset = (strand * (Math.PI * 2)) / 3;

                const twist = h * Math.PI;

                const theta = strandOffset + twist + (Math.random() - 0.5) * 0.5;
                const r = widthProfile * (0.8 + Math.random() * 0.2);

                x = r * Math.cos(theta);
                z = r * Math.sin(theta);
            }

            trophyPositions[i * 3] = x;
            trophyPositions[i * 3 + 1] = y;
            trophyPositions[i * 3 + 2] = z;
        }

        // Initial positions (random)
        geometry.setAttribute('position', new BufferAttribute(randomPositions.slice(), 3));

        // Limit draw range
        geometry.setDrawRange(0, particleCount);
    }

    initPositions();

    const material = new PointsMaterial({
        color: 0x22d3ee, // Cyan/Neon to match theme
        size: 0.06, // Larger, more visible particles
        transparent: true,
        opacity: 0.95,
        blending: AdditiveBlending,
        sizeAttenuation: true // Depth-based sizing for 3D feel
    });

    const particles = new Points(geometry, material);

    // Position to the right
    particles.position.x = 3.5;

    scene.add(particles);

    // Initial Rotation (Tilted slightly for better angle)
    particles.rotation.y = Math.PI / 8; // Rotated ~22 degrees

    camera.position.z = 8;

    // Interaction State
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    // Mouse Move Handler
    window.addEventListener('mousemove', (event) => {
        // Normalize mouse -1 to 1
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // Animation State
    const params = { progress: 0 };

    // ScrollTrigger
    ScrollTrigger.create({
        trigger: "#awards",
        start: "top bottom",
        end: "center 60%", // Balanced based on feedback (was 55, then 70)
        scrub: 1.25, // User requested specific timing
        onUpdate: (self) => {
            params.progress = self.progress;
            updateParticles();
        }
    });

    function updateParticles() {
        // Optimization: Only update visible particles
        const currentPositions = geometry.attributes.position.array;

        // We only need to iterate up to the current particleCount
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            // Lerp between random and trophy positions based on progress
            currentPositions[i3] = randomPositions[i3] + (trophyPositions[i3] - randomPositions[i3]) * params.progress;
            currentPositions[i3 + 1] = randomPositions[i3 + 1] + (trophyPositions[i3 + 1] - randomPositions[i3 + 1]) * params.progress;
            currentPositions[i3 + 2] = randomPositions[i3 + 2] + (trophyPositions[i3 + 2] - randomPositions[i3 + 2]) * params.progress;
        }

        geometry.attributes.position.needsUpdate = true;
    }

    // Visibility Logic
    let isVisible = true; // Default to true to ensure initial render if observer is slow
    let animationFrameId = null;

    // Animation Loop
    function animate() {
        if (!isVisible) {
            animationFrameId = null;
            return; // Stop the loop completely when off-screen
        }

        // Interactive Rotation
        targetRotation.x = mouse.y * 0.5; // Tilt up/down
        targetRotation.y = mouse.x * 0.5; // Rotate left/right

        // Smooth damping
        particles.rotation.x += (targetRotation.x - particles.rotation.x) * 0.05;
        particles.rotation.y += (targetRotation.y - particles.rotation.y) * 0.05;

        // Gentle float
        particles.position.y = Math.sin(Date.now() * 0.001) * 0.1;

        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible && !animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        });
    }, { threshold: 0 }); // Trigger as soon as 1px is visible

    const section = document.getElementById('awards');
    if (section) observer.observe(section);

    // Initial start
    animationFrameId = requestAnimationFrame(animate);

    // Helper for mapping ranges
    function mapRange(value, inMin, inMax, outMin, outMax) {
        const result = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
        const min = Math.min(outMin, outMax);
        const max = Math.max(outMin, outMax);
        return Math.min(Math.max(result, min), max);
    }

    // Responsive Layout Handler
    function updateLayout() {
        const width = window.innerWidth;
        const isMobile = width < 768;

        // Update particle count target
        const newCount = getParticleCount();
        if (newCount !== particleCount) {
            particleCount = newCount;
            geometry.setDrawRange(0, particleCount);
            // Force an update to positions to ensure new particles are in correct place if growing
            updateParticles();
        }

        if (isMobile) {
            // Mobile: Hide trophy
            particles.position.x = 0;
            particles.position.y = 0;
            particles.scale.set(0, 0, 0); // Hide completely
        } else {
            // Desktop: Fluid scaling based on width (768px to 1920px)

            // Scale: 0.55 at 768px -> 0.9 at 1920px (Slightly smaller tweak)
            const scale = mapRange(width, 768, 1920, 0.6, 0.9);

            // Position X: 2.5 at 768px -> 4.0 at 1920px (Shifted right per user request)
            const x = mapRange(width, 768, 1920, 2.0, 3.5);

            // Position Y: -0.3 at 768px -> -0.8 at 1920px
            const y = mapRange(width, 768, 1920, -0.3, -0.8);

            particles.position.x = x;
            particles.position.y = y;
            particles.scale.set(scale, scale, scale);
        }

        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    // Initial Layout
    updateLayout();

    // Safety Force Layout (Fix for potential race condition)
    setTimeout(updateLayout, 100);
    setTimeout(updateLayout, 500);

    // Resize Handler (debounced via requestAnimationFrame)
    let resizeTimeoutId = null;
    window.addEventListener('resize', () => {
        if (resizeTimeoutId) cancelAnimationFrame(resizeTimeoutId);
        resizeTimeoutId = requestAnimationFrame(() => {
            updateLayout();
            resizeTimeoutId = null;
        });
    });
}
