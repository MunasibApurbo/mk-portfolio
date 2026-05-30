import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, PointLight, Raycaster, Vector2, Vector3, Mesh, MeshBasicMaterial, FogExp2, MathUtils, PlaneGeometry, MeshStandardMaterial, DoubleSide, DodecahedronGeometry, InstancedMesh, Object3D, SphereGeometry, Box3, SpotLight, PCFShadowMap } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'; // Import Draco
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


import { SpotlightInteraction } from './spotlight-interaction.js';
import { performanceManager } from './performance-manager.js';

export function initRoverScene() {
    // ... (Keep existing init code up to loader) ...
    const container = document.getElementById('blender-viewport');
    if (!container) return;

    // SCENE
    const scene = new Scene();
    scene.background = null;

    // CAMERA
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const camera = new PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    if (isMobile) {
        camera.position.set(4.5, 3.5, 4.5); // ZOOME: Closer start
    } else {
        camera.position.set(2.8, 2.5, 2.8); // ZOOMED: Closer start (approx -2 units)
    }
    camera.lookAt(0, 1, 0);


    // PERFORMANCE HEURISTIC
    // Subscribe to PerformanceManager


    // Initial Config based on current mode
    let isLowPower = performanceManager.mode === 'EFFICIENCY';

    const renderer = new WebGLRenderer({
        antialias: !isLowPower, // Initial state
        powerPreference: isLowPower ? "default" : "high-performance",
        alpha: true,
        preserveDrawingBuffer: false,
        stencil: false,
        depth: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Initial Pixel Ratio
    renderer.setPixelRatio(isLowPower ? 1.0 : Math.min(window.devicePixelRatio, 1.25));

    // Initial Shadow State
    renderer.shadowMap.enabled = !isLowPower;
    renderer.shadowMap.type = PCFShadowMap;
    container.appendChild(renderer.domElement);

    // DYNAMIC PERFORMANCE HANDLER
    performanceManager.onChange((mode) => {
        const efficiency = mode === 'EFFICIENCY';


        // Adjust Pixel Ratio
        renderer.setPixelRatio(efficiency ? 1.0 : Math.min(window.devicePixelRatio, 1.25));

        // Adjust Shadows (Requires context update or scene traverse normally, but direct prop update works for next frame)
        renderer.shadowMap.enabled = !efficiency;

        // Traverse to update materials if necessary (some mats bake shadow props)
        scene.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = !efficiency;
                child.receiveShadow = !efficiency;
            }
        });
    });

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // Zoom handles via buttons, but this disables wheel zoom
    controls.rotateSpeed = 0.5;
    controls.enablePan = false;
    controls.screenSpacePanning = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.target.set(0, 1, 0);

    // Limits
    controls.minDistance = isMobile ? 3.0 : 1.5;
    controls.maxDistance = isMobile ? 6.0 : 10;
    controls.maxPolarAngle = isMobile ? Math.PI / 2 - 0.2 : Math.PI / 2 - 0.1;

    // INTERACTIVITY GLOBALS
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    let spotlightCtrl;

    // REUSABLE FOCUS FUNCTION
    const focusOnObject = (targetObj) => {
        if (!targetObj) return;
        const box = new Box3().setFromObject(targetObj);
        const center = box.getCenter(new Vector3());

        const direction = new Vector3().subVectors(camera.position, controls.target).normalize();
        const distance = 2.0;
        const newCamPos = center.clone().add(direction.multiplyScalar(distance));

        controls.autoRotate = false;

        const list = document.getElementById('target-list');
        const exit = document.getElementById('btn-exit-view');
        if (list) list.classList.add('opacity-0', 'pointer-events-none');
        if (exit) {
            exit.classList.remove('opacity-0', 'pointer-events-none');
            exit.classList.add('pointer-events-auto');
        }

        gsap.to(controls.target, {
            x: center.x, y: center.y, z: center.z,
            duration: 1.2, ease: "power2.inOut",
            onUpdate: () => controls.update()
        });

        gsap.to(camera.position, {
            x: newCamPos.x, y: newCamPos.y, z: newCamPos.z,
            duration: 1.2, ease: "power2.inOut"
        });
    };

    // LIGHTING
    const ambientLight = new AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    const spotLight = new SpotLight(0xffffff, 50);
    spotLight.position.set(5, 8, 5);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = !isMobile;
    scene.add(spotLight);

    const rimLight = new SpotLight(0x22d3ee, 40);
    rimLight.position.set(-5, 5, -5);
    rimLight.lookAt(0, 0, 0);
    scene.add(rimLight);

    const fillLight = new PointLight(0x8b5cf6, 20);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);


    // LOAD ROVER MODEL WITH DRACO
    const loader = new GLTFLoader();

    // DRACO CONFIGURATION
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/'); // Path to static public folder
    // dracoLoader.setDecoderConfig({ type: 'js' }); // Removed to allow WASM auto-detect
    loader.setDRACOLoader(dracoLoader);

    // TERRAIN GENERATION (Keep existing)
    // --- LIME MARS TERRAIN ---
    const LIME_COLOR = 0xE5F9C9;
    const ROCK_COLOR = 0xcde6a5;

    scene.fog = new FogExp2(0x1a0636, 0.04);

    const generateTerrain = () => {
        const geom = new PlaneGeometry(120, 120, 80, 80);
        const pos = geom.attributes.position;
        // ... (Keep existing terrain logic - truncated for brevity in replace, ensure it remains in file)
        // Check below for instruction on "Keep existing"
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            let z = Math.sin(x * 0.15) * Math.cos(y * 0.15) * 1.5;
            z += Math.sin(x * 0.5 + y * 0.5) * 0.4;
            z += (Math.random() - 0.5) * 0.1;

            const dist = Math.sqrt(x * x + y * y);
            if (dist < 10) z = 0.0;
            else if (dist < 20) {
                const t = (dist - 10) / 10;
                const factor = t * t * (3 - 2 * t);
                z = MathUtils.lerp(0.0, z, factor);
            }
            pos.setZ(i, z);
        }
        geom.computeVertexNormals();
        const mat = new MeshStandardMaterial({
            color: LIME_COLOR,
            roughness: 1.0,
            metalness: 0.0,
            side: DoubleSide
        });
        const terrain = new Mesh(geom, mat);
        terrain.rotation.x = -Math.PI / 2;
        terrain.receiveShadow = true;
        scene.add(terrain);
    };

    const generateRocks = () => {
        // ... (Keep existing rock logic)
        const geom = new DodecahedronGeometry(0.6, 0);
        const mat = new MeshStandardMaterial({ color: ROCK_COLOR, roughness: 0.9, metalness: 0.1 });
        const count = 250;
        const mesh = new InstancedMesh(geom, mat, count);
        mesh.name = 'MARTIAN_ROCK';
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        const dummy = new Object3D();
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const rad = 12 + Math.random() * 45;
            const x = Math.cos(angle) * rad;
            const z = Math.sin(angle) * rad;
            let y = Math.sin(x * 0.15) * Math.cos((-z) * 0.15) * 1.5;
            y += Math.sin(x * 0.5 + (-z) * 0.5) * 0.4;
            if (rad < 20) {
                const t = (rad - 10) / 10;
                if (t < 0) y = 0.0;
                else y = MathUtils.lerp(0.0, y, t);
            }
            const s = 0.5 + Math.random() * 2.5;
            dummy.position.set(x, y + s * 0.3, z);
            dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            dummy.scale.set(s, s, s);
            dummy.updateMatrix();
            mesh.setMatrixAt(i, dummy.matrix);
        }
        scene.add(mesh);
    };

    generateTerrain();
    generateRocks();

    // --- HOTSPOT SYSTEM ---
    const hotspots = [];
    const createHotspot = (x, y, z, label, targetName) => {
        // ... (Keep existing hotspot logic)
        const geometry = new SphereGeometry(0.08, 16, 16);
        const material = new MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.0, visible: false });
        const hotspot = new Mesh(geometry, material);
        hotspot.position.set(x, y, z);
        hotspot.userData = { isHotspot: true, label: label, targetName: targetName };
        gsap.to(hotspot.scale, { x: 1.5, y: 1.5, z: 1.5, duration: 1.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
        scene.add(hotspot);
        hotspots.push(hotspot);
        return hotspot;
    };

    createHotspot(0.9, 0.4, 1.2, "Titanium Wheel", "wheel");
    createHotspot(0.6, 1.8, 0.8, "NavCam Array", "mast");
    createHotspot(-1.0, 0.8, -0.2, "MMRTG Power", "power");
    createHotspot(0.8, 0.6, -1.0, "Robotic Arm", "arm");
    hotspots.forEach(h => { h.castShadow = false; h.receiveShadow = false; });

    const targetListEl = document.querySelector('#target-list ul');
    if (targetListEl) {
        targetListEl.innerHTML = '';
        hotspots.forEach((h, index) => {
            const li = document.createElement('li');
            li.className = "flex items-center justify-between cursor-pointer group hover:text-white transition-colors p-1 hover:bg-white/5 rounded";
            li.innerHTML = `<span>${h.userData.label}</span><span class="w-1.5 h-1.5 bg-cyan-500/30 rounded-full group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_rgba(34,211,238,0.8)] transition-all"></span>`;
            li.addEventListener('click', () => {
                const hudSim = { name: h.userData.targetName, getWorldPosition: (v) => h.getWorldPosition(v) };
                focusOnObject(h);
                uiState.toFocus();
                if (spotlightCtrl) spotlightCtrl.updateHUD(hudSim);
            });
            targetListEl.appendChild(li);
        });
    }

    const uiState = {
        toFocus: () => {
            const list = document.getElementById('target-list');
            const exit = document.getElementById('btn-exit-view');
            if (list) list.classList.add('opacity-0', 'pointer-events-none');
            if (exit) { exit.classList.remove('opacity-0', 'pointer-events-none'); exit.classList.add('pointer-events-auto'); }
        },
        toOverview: () => {
            const list = document.getElementById('target-list');
            const exit = document.getElementById('btn-exit-view');
            if (list) list.classList.remove('opacity-0', 'pointer-events-none');
            if (exit) { exit.classList.add('opacity-0', 'pointer-events-none'); exit.classList.remove('pointer-events-auto'); }
        }
    };

    const btnExit = document.getElementById('btn-exit-view');
    if (btnExit) {
        btnExit.addEventListener('click', () => { if (document.getElementById('reset-view')) document.getElementById('reset-view').click(); });
    }

    // INIT INTERACTION CONTROLLER (EARLY for UI Window)
    spotlightCtrl = new SpotlightInteraction(scene, null);

    // LOAD COMPRESSED ROVER
    loader.load('/models/perseverance/scene-draco.gltf', (gltf) => {

        // Dispatch Loaded Event
        window.dispatchEvent(new CustomEvent('rover-loaded'));
        const rover = gltf.scene;

        // Auto-center and scale
        const box = new Box3().setFromObject(rover);
        const center = box.getCenter(new Vector3());
        const size = box.getSize(new Vector3());

        // Reset position to center
        rover.position.x += (rover.position.x - center.x);
        rover.position.y += (rover.position.y - center.y);
        rover.position.z += (rover.position.z - center.z);

        // Scale to fit nicely (target size approx 2-3 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 3 / maxDim;
        rover.scale.set(scale, scale, scale);

        // Position on floor
        rover.position.y = 0; // Ensure wheels are on grid

        rover.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                // LOGO REMOVAL: Textures contain the logos, so we strip them & apply custom paint.
                if (child.material) {

                    const isWheel = child.name.toLowerCase().includes('wheel');

                    if (isWheel) {
                        // Wheels: Dark Rubber/Metal look
                        child.material.map = null;
                        child.material.color.setHex(0x1a1a1a); // Dark Grey
                        child.material.roughness = 0.9;
                        child.material.metalness = 0.2;
                    } else {
                        // Body: "Cyber White" (Removes NASA/USA texture logos)
                        child.material.map = null;
                        child.material.color.setHex(0xf0f0f0); // Clean White/Silver
                        child.material.roughness = 0.6;
                        child.material.metalness = 0.3;
                    }
                    child.material.needsUpdate = true;
                }
            }
        });

        scene.add(rover);

        // BIND MODEL TO INTERACTION CONTROLLER
        if (spotlightCtrl) {
            spotlightCtrl.setRoverModel(rover);
            spotlightCtrl.updateTransformUI(controls.target);
        }



        // TRANSFORM UI LINK
        controls.addEventListener('change', () => {
            if (spotlightCtrl) spotlightCtrl.updateTransformUI(controls.target);
        });
        // Initial update
        spotlightCtrl.updateTransformUI(controls.target);

    }, (xhr) => {
        // Progress Callback
        if (xhr.lengthComputable) {
            // Clamp to 100% to avoid overflow issues (e.g. gzip mismatch)
            const percentComplete = Math.min((xhr.loaded / xhr.total) * 100, 100);
            window.dispatchEvent(new CustomEvent('rover-progress', {
                detail: { progress: percentComplete }
            }));
        }
    }, (error) => {
        console.error('An error occurred loading the rover:', error);
        // Force load on error to prevent hanging
        window.dispatchEvent(new CustomEvent('rover-loaded'));
    });

    // SCROLL ANIMATION Handled in scroll-animations.js for synchronization

    // Default initial state
    const uiContainer = document.getElementById('blender-ui-window');
    // GSAP set logic moved to CSS/Class toggle in SpotlightInteraction



    // RESET VIEW LOGIC
    const btnReset = document.getElementById('reset-view');
    if (btnReset) {
        btnReset.addEventListener('click', () => {
            // UI State -> Overview
            const list = document.getElementById('target-list');
            const exit = document.getElementById('btn-exit-view');
            if (list) list.classList.remove('opacity-0', 'pointer-events-none');
            if (exit) {
                exit.classList.add('opacity-0', 'pointer-events-none');
                exit.classList.remove('pointer-events-auto');
            }
            if (spotlightCtrl) spotlightCtrl.hideHUD(); // Ensure HUD hides

            const targetPos = isMobile ? new Vector3(4.5, 3.5, 4.5) : new Vector3(2.8, 2.5, 2.8);

            // Animate Target back to center
            gsap.to(controls.target, {
                x: 0, y: 1, z: 0,
                duration: 1.5, ease: "power2.inOut",
                onUpdate: () => controls.update()
            });

            // Animate Camera back to initial
            gsap.to(camera.position, {
                x: targetPos.x, y: targetPos.y, z: targetPos.z,
                duration: 1.5, ease: "power2.inOut",
                onComplete: () => {
                    controls.autoRotate = true; // Restart idle anim
                }
            });
        });
    }

    // MANUAL ZOOM CONTROLS
    const btnZoomIn = document.getElementById('zoom-in');
    const btnZoomOut = document.getElementById('zoom-out');

    // DOLLY Helper Function
    const dollyCamera = (direction) => { // 1 for in, -1 for out
        const targetDistance = 2.0;

        // Get direction vector from camera to target
        const v = new Vector3().subVectors(controls.target, camera.position);
        const dist = v.length();
        v.normalize();

        // Calculate new position
        // If zooming in, we move TOWARDS target. If out, AWAY.
        // Prevent getting too close (min 1.5) or too far (max 10)
        let newDist = dist - (direction * targetDistance);
        if (newDist < 1.5) newDist = 1.5;
        if (newDist > 10) newDist = 10;

        // Calculate new position relative to target
        const offset = v.clone().multiplyScalar(-newDist); // Reverse vector to get camera pos relative to target
        const newPos = new Vector3().addVectors(controls.target, offset);

        gsap.to(camera.position, {
            x: newPos.x, y: newPos.y, z: newPos.z,
            duration: 0.6,
            ease: "power2.out"
        });
    };

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => dollyCamera(1));
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => dollyCamera(-1));

    // OPTIMIZED EVENT HANDLING
    // Prevent default scrolling via CSS + JS, but allow OrbitControls to function naturally.
    container.style.touchAction = 'none'; // Critical for trackpad smoothness

    // Prevent page scroll when using wheel over the viewport
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        // Do NOT stop propagation. OrbitControls needs the event.
    }, { passive: false });

    // OPTIMIZED INTERACTIVITY (Throttled Move + Click)
    let lastRaycast = 0;
    // Pointer is global now

    // Mouse Move for Cursor Feedback
    container.addEventListener('mousemove', (event) => {
        const now = performance.now();
        if (now - lastRaycast < 50) return; // 20fps cap
        lastRaycast = now;

        const rect = container.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        // Change cursor if hovering interactions
        let hovering = false;
        if (intersects.length > 0) {
            // Check if part of rover -> CHANGED: Check if Hotspot
            const obj = intersects[0].object;
            if (obj.userData && obj.userData.isHotspot) hovering = true;
        }
        container.style.cursor = hovering ? 'pointer' : 'default';
    });

    // Single Click Focus (Consolidated)
    container.addEventListener('click', (event) => {
        // Calculate standard pointer
        const rect = container.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;

            // STRICT HOTSPOT CHECK
            if (selectedObject.userData && selectedObject.userData.isHotspot) {
                // Find nearest actual rover part to focus on, or just focus on hotspot loc
                let targetPart = selectedObject; // Default focus on button

                // If we want to focus on the actual mesh near it:
                // We'd need to search the rover model. For simplicity, focusing on the hotspot coord is fine,
                // BUT we want to show the HUD for the *Part*, not the sphere.

                // Hack: Create a fake object with the correct name for the HUD
                const hudSim = {
                    name: selectedObject.userData.targetName,
                    getWorldPosition: (v) => selectedObject.getWorldPosition(v)
                };

                focusOnObject(selectedObject);
                if (spotlightCtrl) spotlightCtrl.updateHUD(hudSim);
            }
        } else {
            // Background Click - Reset/Hide HUD
            if (spotlightCtrl) spotlightCtrl.hideHUD();
        }
    });

    // THROTTLED TRANSFORM UI LINK
    let uiThrottle = false;
    controls.addEventListener('change', () => {
        if (uiThrottle) return;
        uiThrottle = true;
        // Limit UI updates to 15fps roughly to save CPU
        requestAnimationFrame(() => {
            if (spotlightCtrl) spotlightCtrl.updateTransformUI(controls.target);
            uiThrottle = false;
        });
    });
    // Initial update removed (moved to loader)

    // Event listeners attached above

    // VISIBILITY CULLING (Aggressive Performance Save)
    let isVisible = true;
    let animationFrameId = null;

    // ANIMATION LOOP
    const animate = () => {
        if (!isVisible) {
            animationFrameId = null;
            return; // Stop the loop completely when off-screen
        }
        controls.update();
        renderer.render(scene, camera);
        animationFrameId = requestAnimationFrame(animate);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const wasVisible = isVisible;
            isVisible = entry.isIntersecting;
            if (isVisible && !wasVisible && !animationFrameId) {
                animationFrameId = requestAnimationFrame(animate);
            }
        });
    }, { rootMargin: "200px" }); // Pre-load slightly before view

    // Observe both the viewport and transition track to capture all visibility states
    observer.observe(container);
    const transitionTrack = document.getElementById('transition-track');
    if (transitionTrack) observer.observe(transitionTrack);

    // Initial start
    animationFrameId = requestAnimationFrame(animate);

    // RESIZE HANDLING (Robust with ResizeObserver)
    const handleResize = () => {
        if (!container.clientWidth || !container.clientHeight) return; // Wait for non-zero dimensions

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    };

    // Initial sizing check
    handleResize();

    // Watch for size changes
    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // Fallback global resize (for window changes that might not trigger observer immediately)
    window.addEventListener('resize', handleResize);
}
