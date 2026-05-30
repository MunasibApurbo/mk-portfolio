import { gsap } from 'gsap';

export function initCursor() {
    // Disable on mobile/touch devices
    if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(hover: none)").matches) {
        return;
    }

    const cursor = document.getElementById('cursor');
    if (!cursor) return;

    // Initial position off-screen
    gsap.set(cursor, { xPercent: -50, yPercent: -50, opacity: 0, force3D: true });

    const state = {
        mouseX: window.innerWidth / 2,
        mouseY: window.innerHeight / 2,
        currentX: window.innerWidth / 2,
        currentY: window.innerHeight / 2,
        isVisible: false
    };

    // Optimized Mouse Movement using distinct x and y tweens for better performance
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3.out" });

    // Update mouse position on move
    window.addEventListener('mousemove', (e) => {
        // Show cursor on first move
        if (!state.isVisible) {
            state.isVisible = true;
            gsap.to(cursor, { opacity: 1, duration: 0.3 });
        }

        xTo(e.clientX);
        yTo(e.clientY);
    });

    // Hover Effects (Event Delegation for Dynamic Content)
    document.body.addEventListener('mouseover', (e) => {
        const target = e.target.closest('a, button, .hoverable, input, textarea, .magnetic');
        if (target) {
            cursor.classList.add('hovered');

            // MAGNETIC BUTTON LOGIC
            if (target.classList.contains('magnetic')) {
                // Keep track of the magnetic element
                state.magneticElement = target;

                // Animate element on mousemove
                const magnetMove = (e) => {
                    const rect = target.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    // Distance from center
                    const distX = e.clientX - centerX;
                    const distY = e.clientY - centerY;

                    // Pull the button towards mouse (Magnetic strength: 0.3)
                    gsap.to(target, {
                        x: distX * 0.3,
                        y: distY * 0.3,
                        duration: 0.5,
                        ease: "power3.out"
                    });
                    // Pull the cursor towards button center (Sticky feel)
                    cursor.style.transform = `translate3d(${distX * 0.1}px, ${distY * 0.1}px, 0)`;

                };

                target.addEventListener('mousemove', magnetMove);

                // Cleanup on mouseleave
                target.addEventListener('mouseleave', () => {
                    target.removeEventListener('mousemove', magnetMove);
                    state.magneticElement = null;

                    // Reset button position
                    gsap.to(target, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
                }, { once: true });
            }
        }
    });

    document.body.addEventListener('mouseout', (e) => {
        if (e.target.matches('a, button, .hoverable, input, textarea, .magnetic') || e.target.closest('a, button, .hoverable, input, textarea, .magnetic')) {
            cursor.classList.remove('hovered');
        }
    });
}
