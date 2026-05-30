/**
 * Cursor Trail Effect
 * Creates a glowing particle trail following the cursor.
 * Desktop only - disabled on touch devices.
 */

export function initCursorTrail() {
    // Disable on mobile/touch devices
    if (window.matchMedia("(max-width: 768px)").matches || window.matchMedia("(hover: none)").matches) {
        return;
    }

    const trailCount = 12;
    const trails = [];
    const positions = [];

    // Create trail dots
    for (let i = 0; i < trailCount; i++) {
        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: ${8 - i * 0.4}px;
            height: ${8 - i * 0.4}px;
            background: white;
            border-radius: 50%;
            pointer-events: none;
            z-index: 19999;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s ease;
            mix-blend-mode: difference;
        `;
        document.body.appendChild(dot);
        trails.push(dot);
        positions.push({ x: 0, y: 0 });
    }

    let mouseX = 0;
    let mouseY = 0;
    let animId = null;
    let hideTimeout;

    function animate() {
        positions[0].x += (mouseX - positions[0].x) * 0.3;
        positions[0].y += (mouseY - positions[0].y) * 0.3;

        for (let i = 1; i < trailCount; i++) {
            positions[i].x += (positions[i - 1].x - positions[i].x) * 0.25;
            positions[i].y += (positions[i - 1].y - positions[i].y) * 0.25;
        }

        trails.forEach((dot, i) => {
            dot.style.transform = `translate3d(${positions[i].x}px, ${positions[i].y}px, 0) translate(-50%, -50%)`;
        });

        animId = requestAnimationFrame(animate);
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        trails.forEach(dot => dot.style.opacity = '1');
        if (!animId) animate(); // Restart loop

        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(() => {
            trails.forEach(dot => dot.style.opacity = '0');
            if (animId) { cancelAnimationFrame(animId); animId = null; }
        }, 500);
    });
}
