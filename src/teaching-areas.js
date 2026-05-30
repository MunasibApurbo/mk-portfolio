import { Scene, PerspectiveCamera, WebGLRenderer, Group, CanvasTexture, LinearFilter, SpriteMaterial, Sprite, Vector3, Raycaster, Vector2, Clock, MathUtils } from 'three';

import { teachingSubjects } from './data.js';

export function initTeachingAreas() {
    const canvas = document.getElementById('teaching-canvas');
    const container = document.getElementById('teaching-canvas-container');

    if (canvas && container) {
        // Scene Setup
        const scene = new Scene();


        const camera = new PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 8;

        const isLowPower = document.body.classList.contains('efficiency-mode');
        const renderer = new WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: !isLowPower // Disable AA in efficiency mode
        });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1)); // Crisp enough, saves huge GPU

        // Teaching Subjects: Imported from data.js
        const subjects = teachingSubjects;

        // Create Text Sprites Group
        const sprites = new Group();
        scene.add(sprites);

        function createTextTexture(text, color = '#22d3ee') {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const fontSize = 70;
            // Use Space Grotesk as previously requested
            const font = `bold ${fontSize}px "Space Grotesk", sans-serif`;

            // Measure text
            ctx.font = font;
            const upperText = text.toUpperCase();
            const metrics = ctx.measureText(upperText);
            const width = metrics.width;
            const height = fontSize * 1.2;

            canvas.width = width + 80; // Padding
            canvas.height = height + 80;

            // Draw Text
            ctx.font = font;
            ctx.fillStyle = color;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(upperText, canvas.width / 2, canvas.height / 2);

            const texture = new CanvasTexture(canvas);
            texture.minFilter = LinearFilter;
            return { texture, aspectRatio: canvas.width / canvas.height };
        }

        // Distribute Sprites in a Sphere
        const radius = 3.9;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const angleIncrement = Math.PI * 2 * goldenRatio;

        subjects.forEach((subject, i) => {
            const { texture, aspectRatio } = createTextTexture(subject.name, subject.color);
            const material = new SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.9
            });

            const sprite = new Sprite(material);

            // Scale based on aspect ratio
            const baseScale = 0.75;
            sprite.scale.set(baseScale * aspectRatio, baseScale, 1);

            // Fibonacci Sphere Distribution
            const t = i / subjects.length;
            const inclination = Math.acos(1 - 2 * t);
            const azimuth = angleIncrement * i;

            const x = radius * Math.sin(inclination) * Math.cos(azimuth);
            const y = radius * Math.sin(inclination) * Math.sin(azimuth);
            const z = radius * Math.cos(inclination);

            sprite.position.set(x, y, z);

            // Store original position and scale info for animation and responsiveness
            sprite.userData = {
                originalPos: new Vector3(x, y, z),
                randomOffset: Math.random() * Math.PI * 2,
                speed: 0.002 + Math.random() * 0.002,
                baseScale: baseScale,
                aspectRatio: aspectRatio
            };

            sprites.add(sprite);
        });

        // Interaction State
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocity = { x: 0, y: 0 };
        const friction = 0.95;
        const autoRotateSpeed = 0.001;
        let mouseMoved = false;

        // Raycaster for hover
        const raycaster = new Raycaster();
        const mouse = new Vector2();

        // Event Listeners
        function onPointerDown(event) {
            isDragging = true;
            previousMousePosition = {
                x: event.clientX || event.touches[0].clientX,
                y: event.clientY || event.touches[0].clientY
            };
        }

        function onPointerMove(event) {
            mouseMoved = true;
            const clientX = event.clientX || (event.touches ? event.touches[0].clientX : 0);
            const clientY = event.clientY || (event.touches ? event.touches[0].clientY : 0);

            // Update mouse for raycaster
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

            if (isDragging) {
                const deltaMove = {
                    x: clientX - previousMousePosition.x,
                    y: clientY - previousMousePosition.y
                };

                rotationVelocity.x = deltaMove.y * 0.002;
                rotationVelocity.y = deltaMove.x * 0.002;

                sprites.rotation.x += rotationVelocity.x;
                sprites.rotation.y += rotationVelocity.y;

                previousMousePosition = { x: clientX, y: clientY };
            }
        }

        function onPointerUp() {
            isDragging = false;
        }

        canvas.addEventListener('mousedown', onPointerDown);
        canvas.addEventListener('touchstart', onPointerDown, { passive: false });

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove, { passive: false }); // Ensure touch drag works

        // Fix: Stop dragging on release
        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        // Initialize Clock
        const clock = new Clock();

        // Reusable Variables for Performance
        const tempVector = new Vector3();
        const hoverScale = new Vector3();
        const targetScale = new Vector3();

        // Visibility Culling (Pause when off-screen)
        let isVisible = false;
        let animationFrameId = null;

        function animate() {
            if (!isVisible) {
                animationFrameId = null;
                return; // Stop the loop completely when off-screen
            }

            const time = clock.getElapsedTime();

            if (!isDragging) {
                // Apply momentum
                sprites.rotation.x += rotationVelocity.x;
                sprites.rotation.y += rotationVelocity.y;

                // Friction
                rotationVelocity.x *= friction;
                rotationVelocity.y *= friction;

                // Auto-rotation when slow
                if (Math.abs(rotationVelocity.y) < 0.0005) {
                    sprites.rotation.y += autoRotateSpeed;
                }
            }

            // Update Sprites (Bobbing & Depth Fading)
            sprites.children.forEach(sprite => {
                const { originalPos, randomOffset } = sprite.userData;

                // Bobbing
                sprite.position.y = originalPos.y + Math.sin(time * 2 + randomOffset) * 0.2;

                // Depth Fading
                // Get world position using reusable vector
                sprite.getWorldPosition(tempVector);

                // Calculate opacity based on Z depth
                // Closer (positive Z) = higher opacity
                // Further (negative Z) = lower opacity
                // Range roughly -4.5 to 4.5
                const depthFactor = (tempVector.z + 5) / 10; // Normalize 0 to 1
                const targetOpacity = Math.max(0.1, Math.min(1, depthFactor));

                // Store target opacity for hover logic to use as base
                sprite.userData.baseOpacity = targetOpacity;

                // Apply opacity (will be overridden by hover if active)
                if (!sprite.userData.isHovered) {
                    sprite.material.opacity = targetOpacity;
                }
            });

            // Raycasting for hover effect (Optimized)
            if (mouseMoved) {
                raycaster.setFromCamera(mouse, camera);
                const intersects = raycaster.intersectObjects(sprites.children);

                // Reset Hover State
                sprites.children.forEach(s => s.userData.isHovered = false);

                if (intersects.length > 0) {
                    const hoveredSprite = intersects[0].object;
                    hoveredSprite.userData.isHovered = true;
                }
                mouseMoved = false; // Reset flag
            }

            // Updates Visuals based on State
            sprites.children.forEach(sprite => {
                if (sprite.userData.isHovered) {
                    // Hover State
                    const baseScale = 0.95;
                    const aspectRatio = sprite.scale.x / sprite.scale.y;
                    hoverScale.set(baseScale * aspectRatio * 1.2, baseScale * 1.2, 1);
                    sprite.scale.lerp(hoverScale, 0.1);
                    sprite.material.opacity = 1;
                } else {
                    // Normal State
                    const baseScale = 0.95;
                    const aspectRatio = sprite.scale.x / sprite.scale.y;
                    targetScale.set(baseScale * aspectRatio, baseScale, 1);
                    sprite.scale.lerp(targetScale, 0.1);
                    sprite.material.opacity = MathUtils.lerp(sprite.material.opacity, sprite.userData.baseOpacity, 0.1);
                }
            });

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
        }, { threshold: 0 });
        if (container) observer.observe(container);

        // Initial start
        animationFrameId = requestAnimationFrame(animate);

        // Resize & Responsive Handler
        function handleResize() {
            const isMobile = window.innerWidth < 768;

            // Adjust camera distance and sprite scales for mobile
            if (isMobile) {
                camera.position.z = 14; // Closer on mobile (was 18)
                sprites.position.y = 1.0; // Adjusted Y offset

                // Make sprites smaller on mobile
                sprites.children.forEach(sprite => {
                    const { baseScale, aspectRatio } = sprite.userData;
                    const mobileScale = baseScale * 0.5; // 50% of desktop size for smaller mobile text
                    sprite.scale.set(mobileScale * aspectRatio, mobileScale, 1);
                });
            } else {
                camera.position.z = 8; // Closer on desktop
                sprites.position.y = 0; // Reset position

                // Restore original scale on desktop
                sprites.children.forEach(sprite => {
                    const { baseScale, aspectRatio } = sprite.userData;
                    sprite.scale.set(baseScale * aspectRatio, baseScale, 1);
                });
            }

            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        }

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
    }
}
