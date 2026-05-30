import { gsap } from 'gsap';

/**
 * 3D Tilt Effect using GSAP
 * Smoother, more performant, and consistent with other animations.
 */
const initTiltEffect = () => {
    // Disable on mobile/touch devices
    if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(hover: none)").matches) {
        return;
    }

    const cards = document.querySelectorAll('.tilt-card');

    if (cards.length === 0) return;

    cards.forEach(card => {
        // Prevent double initialization
        if (card.dataset.tiltInitialized) return;
        card.dataset.tiltInitialized = "true";

        // State for interpolation
        const state = {
            mouseX: 0,
            mouseY: 0,
            currentX: 0,
            currentY: 0,
            targetX: 0,
            targetY: 0,
            isHovering: false
        };

        // Set perspective
        gsap.set(card, { transformPerspective: 1000, transformStyle: "preserve-3d" });

        // Mouse Move - Update Target
        card.addEventListener('mousemove', (e) => {
            if (!state.isHovering) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate target rotation (Max 8 degrees for more visible effect)
            state.targetX = ((y - centerY) / centerY) * -8;
            state.targetY = ((x - centerX) / centerX) * 8;
        });

        // Efficient Animation Handling
        let tickerActive = false;

        const updateTilt = () => {
            if (state.isHovering || Math.abs(state.currentX) > 0.01 || Math.abs(state.currentY) > 0.01) {
                // Linear Interpolation (Lerp)
                state.currentX += (state.targetX - state.currentX) * 0.1;
                state.currentY += (state.targetY - state.currentY) * 0.1;

                // Add skew if it's a timeline card OR has shape-parallelogram to preserve shape
                const isTimelineCard = card.classList.contains('timeline-card');
                const isParallelogram = card.classList.contains('shape-parallelogram');

                // Determine skew value: -12 for Parallelograms/Timeline, 0 for others
                const skewValue = (isTimelineCard || isParallelogram) ? -12 : 0;

                gsap.set(card, {
                    rotationX: state.currentX,
                    rotationY: state.currentY,
                    skewX: skewValue // Force Skew for Parallelogram shape
                });
            } else {
                // Stop ticker if settled and not hovering
                gsap.ticker.remove(updateTilt);
                tickerActive = false;
            }
        };

        const startTicker = () => {
            if (!tickerActive) {
                gsap.ticker.add(updateTilt);
                tickerActive = true;
            }
        };

        // Mouse Enter
        card.addEventListener('mouseenter', () => {
            state.isHovering = true;
            startTicker(); // Start animating

            // Scale UP current - ONLY animate the active card
            // FIX: Enforce opacity: 1 to prevents "disappearing" glitch if ScrollTrigger is overwritten
            // FIX: Set zIndex immediately to avoid reflow/paint flashes
            gsap.set(card, { zIndex: 10 });
            gsap.to(card, {
                scale: 1.02,
                opacity: 1, // FORCE VISIBILITY
                duration: 0.4,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });

        // Mouse Leave
        card.addEventListener('mouseleave', () => {
            state.isHovering = false;
            state.targetX = 0;
            state.targetY = 0;
            // Ticker continues running until values settle near 0

            // Reset Scale - ONLY animate the active card
            gsap.to(card, {
                scale: 1,
                zIndex: 1,
                duration: 0.5,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    });
};

export { initTiltEffect };
