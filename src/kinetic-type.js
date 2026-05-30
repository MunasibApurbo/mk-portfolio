import gsap from 'gsap';

export function initKineticType(lenis) {
    // Select all kinetic text elements
    // We target h1 and h2 by default, or specific .kinetic-text classes
    const targets = document.querySelectorAll('h1, h2, .kinetic-text');

    if (!targets.length) return;

    // Apply Kinetic Skew based on scroll velocity
    lenis.on('scroll', ({ velocity }) => {
        // Velocity can be high, so we dampen it
        const skewAmount = velocity * 0.25;

        // Clamp skew to avoid text becoming unreadable
        const clampedSkew = Math.max(-10, Math.min(10, skewAmount));

        gsap.to(targets, {
            skewX: -clampedSkew, // Invert for natural feel (drag back)
            overwrite: true, // Important: overwrite previous tweens for performance
            duration: 0.1,
            ease: "power1.out"
        });
    });
}
