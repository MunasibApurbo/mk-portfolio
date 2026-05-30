import { MeshBasicMaterial, MeshStandardMaterial, Vector3 } from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Manages the interaction between the DOM UI and the Three.js Rover Scene.
 * - Handles View Mode Switching (Wireframe / Solid / Rendered)
 * - Manages Entrance Animations
 */
export class SpotlightInteraction {
    constructor(scene, roverModel = null) {
        this.scene = scene;
        this.roverModel = roverModel; // The GLTF Scene object (can be null initially)
        this.materialsMap = new Map(); // Store original materials

        // DOM Elements
        this.uiWindow = document.getElementById('blender-ui-window');
        this.loader = document.getElementById('game-loader');
        this.loaderBar = document.getElementById('game-loader-bar');
        this.loaderText = document.getElementById('loader-status');

        this.btnWireframe = document.getElementById('mode-wireframe');
        this.btnSolid = document.getElementById('mode-solid');
        this.btnRender = document.getElementById('mode-render');

        this.isAssetLoaded = false;

        // Listen for real load completion
        window.addEventListener('rover-loaded', () => {
            this.isAssetLoaded = true;
            // If we are currently visible/loading, finish it
            if (this.uiWindow.classList.contains('active')) {
                this.finishLoading();
            }
        });

        this.init();
        if (this.roverModel) {
            this.captureOriginalMaterials();
        }
    }

    setRoverModel(model) {
        this.roverModel = model;
        this.captureOriginalMaterials();
        // If we heavily rely on the model for initial state, update it here
        this.setMode(this.currentMode);
    }

    init() {
        if (!this.uiWindow) return;

        // 1. Setup ScrollTrigger for Entrance
        // 1. Setup ScrollTrigger for Entrance
        // TRIGGER FIX: Since Spotlight is inside a horizontal scroll (pinned), 
        // we trigger based on the completion of the pinned track (#transition-track).
        // Spotlight is the last item, so it appears roughly at 70-100% of the scroll.
        ScrollTrigger.create({
            trigger: "#transition-track",
            start: "60% top", // When 60% of the pinned track has scrolled past top
            end: "bottom bottom",
            onEnter: () => {
                if (this.exitTimer) clearTimeout(this.exitTimer);
                this.handleEntrance();
            },
            onEnterBack: () => {
                if (this.exitTimer) clearTimeout(this.exitTimer);
                this.handleEntrance();
            },
            onLeaveBack: () => this.handleExit() // Immediate fade when scrolling up
        });

        // 2. Setup Button Listeners
        this.setupViewModes();
        this.setupTooltips();

        // Default Mode
        this.currentMode = 'rendered';
        this.updateButtons();
    }

    setupTooltips() {
        // Universal Neon Tooltip logic
        const tooltip = document.getElementById('global-tooltip');
        if (!tooltip) return;

        const targets = document.querySelectorAll('[data-tooltip]');
        targets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                tooltip.textContent = el.getAttribute('data-tooltip');
                tooltip.style.opacity = '1';
                // optional: could position dynamically, but fixed pill is cleaner for this style
            });
            el.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
            });
        });
    }

    setupViewModes() {
        if (this.btnWireframe) {
            this.btnWireframe.addEventListener('click', () => this.setMode('wireframe'));
        }
        if (this.btnSolid) {
            this.btnSolid.addEventListener('click', () => this.setMode('solid'));
        }
        if (this.btnRender) {
            this.btnRender.addEventListener('click', () => this.setMode('rendered'));
        }
    }

    // New HUD Method
    updateHUD(object) {
        const hud = document.getElementById('data-hud');
        if (!hud) return;

        // Populate Data
        const titleEl = document.getElementById('hud-title');
        const coordsEl = document.getElementById('hud-coords');

        // Logic to get clean name
        const rawName = object.name || '';
        let cleanName = 'UNKNOWN SYSTEM';
        const lower = rawName.toLowerCase();

        // Manual Map based on likely Rover parts
        if (lower.includes('wheel')) cleanName = 'TITANIUM WHEEL';
        else if (lower.includes('chassis') || lower.includes('body')) cleanName = 'MAIN BODY';
        else if (lower.includes('mast') || lower.includes('head') || lower.includes('cam')) cleanName = 'SENSOR MAST';
        else if (lower.includes('suspen')) cleanName = 'SUSPENSION ARM';
        else if (lower.includes('antenna')) cleanName = 'UHF ANTENNA';
        else if (lower.includes('drill')) cleanName = 'CORING DRILL';
        else if (lower.includes('arm')) cleanName = 'ROBOTIC ARM';
        else if (lower.includes('power') || lower.includes('rtg')) cleanName = 'MMRTG POWER';
        else if (lower.includes('rock') || lower.includes('martian')) cleanName = 'BASALT DEPOSIT';
        else {
            // Heuristic formatter
            if (rawName.toLowerCase().startsWith('object') || rawName.match(/_\d+/)) {
                cleanName = 'STRUCTURAL ALLOY';
            }
            else if (rawName.length > 2 && rawName.length < 25) {
                cleanName = rawName.replace(/_/g, ' ').replace(/-/g, ' ').toUpperCase();
            }
        }

        if (titleEl) titleEl.textContent = cleanName;

        // Fake coords or real world pos
        const pos = object.getWorldPosition(new Vector3());
        if (coordsEl) coordsEl.textContent = `X:${pos.x.toFixed(2)} Y:${pos.y.toFixed(2)} Z:${pos.z.toFixed(2)}`;

        // Show HUD (GSAP)
        gsap.to(hud, {
            opacity: 1,
            x: 0, // Reset translate
            duration: 0.4,
            ease: "power2.out"
        });

        // Hide Onboarding if visible
        const toast = document.getElementById('onboarding-toast');
        if (toast) toast.style.opacity = '0';
    }

    hideHUD() {
        const hud = document.getElementById('data-hud');
        if (hud) {
            gsap.to(hud, {
                opacity: 0,
                x: 40, // Slide out right
                duration: 0.3,
                ease: "power2.in"
            });
        }
    }

    // Legacy support methods removed (setupToolbar, setupOutliner, etc)

    /**
     * Store original materials so we can restore them later
     */
    captureOriginalMaterials() {
        if (!this.roverModel) return;

        this.roverModel.traverse((child) => {
            if (child.isMesh) {
                // Store original material
                this.materialsMap.set(child.uuid, child.material);
            }
        });
    }

    setMode(mode) {
        if (this.currentMode === mode) return;
        this.currentMode = mode;
        this.updateButtons();

        if (!this.roverModel) return;

        this.roverModel.traverse((child) => {
            if (child.isMesh) {
                if (mode === 'wireframe') {
                    child.material = new MeshBasicMaterial({
                        color: 0x22d3ee, // Neon Cyan
                        wireframe: true,
                        transparent: true,
                        opacity: 0.3
                    });
                } else if (mode === 'solid') {
                    child.material = new MeshStandardMaterial({
                        color: 0x888888, // Clay grey
                        roughness: 0.5,
                        metalness: 0.1
                    });
                } else if (mode === 'rendered') {
                    // Restore original PBR
                    if (this.materialsMap.has(child.uuid)) {
                        child.material = this.materialsMap.get(child.uuid);
                    }
                }
            }
        });
    }

    updateButtons() {
        // Reset states
        [this.btnWireframe, this.btnSolid, this.btnRender].forEach(btn => {
            if (btn) {
                // Remove Active Classes
                btn.classList.remove(
                    'bg-cyan-500/10',
                    'text-cyan-400',
                    'shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]',
                    'border-cyan-500/30',
                    'shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                );

                // Add Inactive Classes
                btn.classList.add('text-white/40', 'border-transparent');
            }
        });

        // Activate current
        let activeBtn;
        if (this.currentMode === 'wireframe') activeBtn = this.btnWireframe;
        if (this.currentMode === 'solid') activeBtn = this.btnSolid;
        if (this.currentMode === 'rendered') activeBtn = this.btnRender;

        if (activeBtn) {
            // Remove Inactive Classes
            activeBtn.classList.remove('text-white/40', 'border-transparent');

            // Add Active Classes
            activeBtn.classList.add(
                'bg-cyan-500/10',
                'text-cyan-400',
                'shadow-[inset_0_0_10px_rgba(34,211,238,0.2)]',
                'border-cyan-500/30',
                'shadow-[0_0_15px_rgba(34,211,238,0.3)]'
            );
        }
    }

    // Removed: updateTransformUI (replaced by updateHUD)
    updateTransformUI(target) {
        // No-op or removed to prevent errors if still called
    }

    handleEntrance() {
        this.uiWindow.classList.add('active');
        this.uiWindow.style.pointerEvents = 'auto'; // Re-enable interaction

        // Check if we've already shown the intro animation once
        if (this.hasShownIntro) {
            // Already shown? Hide loader immediately and just show UI
            if (this.loader) {
                this.loader.style.opacity = '0';
                this.loader.style.display = 'none';
            }
            this.playEntranceSequence();
            return;
        }

        // FIRST TIME: Show Loader Loop
        if (this.loader) {
            gsap.killTweensOf(this.loader);
            this.loader.style.opacity = '1';
            this.loader.style.display = 'flex';
        }
        if (this.loaderBar) {
            gsap.killTweensOf(this.loaderBar);
            this.loaderBar.style.width = '0%';
        }
        if (this.loaderText) {
            this.loaderText.innerText = "INITIALIZING...";
        }

        // Mark as shown so subsequent entries skip this
        this.hasShownIntro = true;

        // If assets are already ready (background load finished), simulate the sequence
        // so the user still gets the "Game Loading" experience.
        if (this.isAssetLoaded || document.body.classList.contains('assets-ready')) {
            this.isAssetLoaded = true;
            this.simulateLoadingSequence();
        }
        // If not ready, we do nothing and let the real 'rover-progress' events drive the bar
        // and 'rover-loaded' event trigger finishLoading()
    }

    handleExit() {
        this.uiWindow.classList.remove('active');
        this.uiWindow.style.pointerEvents = 'none'; // Disable interaction when hidden
        // We don't need to hide loader here, we reset it on Enter
    }

    simulateLoadingSequence() {
        // Fake Load
        if (this.loaderText) this.loaderText.innerText = "RE-INITIALIZING SYSTEMS...";

        gsap.to(this.loaderBar, {
            width: '100%',
            duration: 1.2,
            ease: "power2.inOut",
            onComplete: () => this.finishLoading()
        });
    }

    finishLoading() {
        if (this.loaderText) this.loaderText.innerText = "SYSTEM ONLINE";

        // Flash bar
        gsap.to(this.loaderBar, {
            boxShadow: "0 0 30px rgba(34,211,238,1)",
            duration: 0.2,
            yoyo: true,
            repeat: 1
        });

        // Hide Loader
        gsap.to(this.loader, {
            opacity: 0,
            duration: 0.6,
            delay: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                this.loader.style.display = 'none';
                this.playEntranceSequence(); // Play the button slide-ins
            }
        });
    }

    playEntranceSequence() {
        // Just the toasts and buttons
        // Show Onboarding Toast
        const toast = document.getElementById('onboarding-toast');
        if (toast) {
            gsap.fromTo(toast,
                { opacity: 0, y: 10 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: 0.5,
                    ease: "power2.out"
                });
            // Fade Out after 8 seconds
            gsap.to(toast, {
                opacity: 0,
                y: 10,
                duration: 0.8,
                delay: 6.0,
                ease: "power2.in"
            });
        }
    }
}
