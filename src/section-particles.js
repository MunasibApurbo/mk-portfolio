
import { performanceManager } from './performance-manager.js';

export function initSectionParticles() {
    // Unified Particle Configuration (Awards Style: Slow, Floating, Subtle)
    const particleConfig = {
        count: 60,             // Reduced from 80 for lighter feel
        color: '34, 211, 238', // Cyan
        minSize: 2.5,          // Increased size
        maxSize: 4.5,
        minSpeed: 1.0,         // Constant speed as requested
        maxSpeed: 1.0,
        opacity: 0.4,          // Subtle
        interactive: true
    };

    // Unified Particle System for the entire Timeline/Expertise section
    createParticleSystem('timeline-particles-container', particleConfig);
}

function createParticleSystem(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Visibility Check (Performance Optimization)
    let isVisible = true;
    let animationFrameId = null;
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible && !animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        });
    }, { threshold: 0 }); // Trigger as soon as 1px is visible
    observer.observe(container);

    // Create Canvas
    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; // Click-through
    canvas.style.zIndex = options.zIndex !== undefined ? options.zIndex : 1;

    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Mouse Interaction
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Global mouse tracker
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Resize Handler
    const resize = () => {
        width = container.clientWidth;
        height = container.clientHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    };

    // Particle Logic
    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 10;
            this.baseX = this.x; // Not strictly needed for infinite scrolling but good for parallax anchor if we wanted
            this.baseY = this.y;
            this.size = Math.random() * (options.maxSize - options.minSize) + options.minSize;
            this.speed = Math.random() * (options.maxSpeed - options.minSpeed) + options.minSpeed;
            this.opacity = Math.random() * options.opacity;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.05 + 0.01;

            // Interaction: Parallax Factor (Larger = Closer = Moves more)
            this.parallaxFactor = this.size * 0.05;
        }

        update() {
            // Normal Movement
            this.y -= this.speed;
            this.wobble += this.wobbleSpeed;
            // Native horizontal drift
            const nativeDrift = Math.sin(this.wobble) * 0.5;

            // Interaction: Global Parallax
            // Calculate offset based on mouse position from center
            let parallaxX = 0;
            let parallaxY = 0;

            if (options.interactive && performanceManager.mode !== 'EFFICIENCY') {
                const centerX = window.innerWidth / 2;
                const centerY = window.innerHeight / 2;
                parallaxX = (mouse.x - centerX) * this.parallaxFactor;
                parallaxY = (mouse.y - centerY) * this.parallaxFactor;
            }

            // Actual position to draw = Logical Position + Parallax Offset
            this.drawX = this.x + nativeDrift + parallaxX;
            this.drawY = this.y + parallaxY;

            // Blink
            this.opacity += Math.sin(this.wobble) * 0.005;

            // Reset if out of bounds (Logical Y)
            if (this.y < -10) {
                this.reset();
            }
        }

        draw() {
            // GC Optimization: Avoid string concat per frame
            ctx.globalAlpha = Math.max(0, this.opacity);
            ctx.fillStyle = `rgb(${options.color})`;

            // Draw Square instead of Council
            // Size is roughly equivalent to diameter, so we draw it centered
            ctx.fillRect(this.drawX - this.size / 2, this.drawY - this.size / 2, this.size, this.size);

            // Reset composite for next frame operations (though strictly we clearRect anyway)
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1.0;
        }
    }

    function initParticles() {
        particles = [];

        // Density-based count to ensure consistency across different section sizes
        // Journey is tall (scrollable), Teaching is short (viewport). 
        // Fixed count causes sparsity differences.
        const area = width * height;
        const densityFactor = 15000; // Pixels per particle
        let calculatedCount = Math.floor(area / densityFactor);

        // Clamping to avoid performance issues or emptiness
        const minCount = 40;
        const maxCount = 600; // Increased cap for tall merged timeline
        calculatedCount = Math.max(minCount, Math.min(calculatedCount, maxCount));

        if (performanceManager.mode === 'EFFICIENCY') {
            calculatedCount = 50; // Efficiency mode cap
        }

        if (window.innerWidth < 768) {
            calculatedCount = Math.floor(calculatedCount * 0.5);
        }

        for (let i = 0; i < calculatedCount; i++) {
            particles.push(new Particle());
        }
    }

    // Dynamic Listener
    performanceManager.onChange(() => {
        initParticles(); // Re-init on mode change
    });

    function animate() {
        if (!isVisible) {
            animationFrameId = null;
            return; // Stop the loop completely when off-screen
        }
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        animationFrameId = requestAnimationFrame(animate);
    }

    let resizeTimeoutId = null;
    window.addEventListener('resize', () => {
        if (resizeTimeoutId) cancelAnimationFrame(resizeTimeoutId);
        resizeTimeoutId = requestAnimationFrame(() => {
            resize();
            resizeTimeoutId = null;
        });
    });
    resize();
    animationFrameId = requestAnimationFrame(animate);
}
