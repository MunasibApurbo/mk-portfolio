
export class PerformanceManager {
    constructor() {
        this.mode = 'HIGH_PERFORMANCE'; // Default
        this.fpsHistory = [];
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.checkInterval = 2000; // Check every 2 seconds
        this.lastCheck = 0;
        this.listeners = [];

        // Thresholds
        this.FPS_THRESHOLD_LOW = 30; // Downgrade if below this (was 25)
        this.FPS_THRESHOLD_HIGH = 55; // Upgrade if consistently above this
        // Counters to prevent flip-flopping
        this.lowFpsCount = 0;
        this.highFpsCount = 0;

        this.init();
    }

    init() {
        // 1. Static Hardware Detection
        this.detectHardware();

        // 2. Start Dynamic Monitoring
        this.monitoring = false;
        this.frameId = null;
        this.startMonitoring();

        // Listen to visibilitychange to pause/resume monitoring loop
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopMonitoring();
            } else {
                this.startMonitoring();
            }
        });
    }

    detectHardware() {
        const concurrency = navigator.hardwareConcurrency || 4;
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

        let isIntegrated = false;
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                    // Detect common integrated usage
                    if (renderer) {
                        isIntegrated = /Intel|Integrated|HD Graphics|UHD|SwiftShader|Basic Render/i.test(renderer);
                    }
                }
            }
        } catch (e) {
            console.warn("WebGL Renderer detection failed", e);
        }

        if (concurrency < 4 || isMobile || isIntegrated) {
            this.setMode('EFFICIENCY');
        } else {
            this.setMode('HIGH_PERFORMANCE');
        }


    }

    startMonitoring() {
        if (this.monitoring) return;
        this.monitoring = true;
        this.lastFrameTime = performance.now();
        this.lastCheck = this.lastFrameTime;
        this.frameCount = 0;

        const loop = (time) => {
            if (!this.monitoring) return;
            this.frameId = requestAnimationFrame(loop);

            const delta = time - this.lastFrameTime;
            this.lastFrameTime = time;
            this.frameCount++;

            // Run check periodically
            if (time - this.lastCheck > this.checkInterval) {
                const fps = Math.round((this.frameCount * 1000) / (time - this.lastCheck));
                this.evaluatePerformance(fps);

                this.frameCount = 0;
                this.lastCheck = time;
            }
        };
        this.frameId = requestAnimationFrame(loop);
    }

    stopMonitoring() {
        this.monitoring = false;
        if (this.frameId) {
            cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }
    }

    evaluatePerformance(fps) {
        // Only adjust automatically if we assume we aren't throttled by background tabs
        if (document.hidden) return;

        // DOWNGRADE LOGIC
        if (fps < this.FPS_THRESHOLD_LOW) {
            this.lowFpsCount++;
            this.highFpsCount = 0;
            if (this.lowFpsCount > 1 && this.mode === 'HIGH_PERFORMANCE') {
                console.warn(`[PerformanceManager] Low FPS detected (${fps}). Downgrading to EFFICIENCY.`);
                this.setMode('EFFICIENCY');
                this.showToast('PERFORMANCE OPTIMIZED TO MAINTAIN FRAMERATE');
            }
        }
        // UPGRADE LOGIC (Conservative)
        else if (fps > this.FPS_THRESHOLD_HIGH) {
            this.highFpsCount++;
            this.lowFpsCount = 0;
            // Only try to upgrade if we've had solid performance for a long time (e.g. 10 checks = 20s)
            // And maybe don't auto-upgrade if hardware was detected as potato initially? 
            // For now, let's keep it sticky downwards: Once efficiency, stay efficiency unless forced.
            // This prevents oscillating. Users rarely complain about "too smooth", but they hate lag.
        }
    }

    setMode(newMode) {
        if (this.mode === newMode) return;
        this.mode = newMode;

        // Apply Global Class
        if (this.mode === 'EFFICIENCY') {
            document.body.classList.add('efficiency-mode');
        } else {
            document.body.classList.remove('efficiency-mode');
        }

        // Notify Listeners
        this.listeners.forEach(cb => cb(this.mode));
    }

    onChange(callback) {
        this.listeners.push(callback);
        // Fire immediately with current state
        callback(this.mode);
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-violet-950/90 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-lg backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.2)] text-xs font-mono z-[1000] pointer-events-none opacity-0 translate-y-4 transition-all duration-500';
        toast.innerHTML = `<span class="mr-2">⚡</span> SYSTEM: ${message}`;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.remove('opacity-0', 'translate-y-4');
        });

        setTimeout(() => toast.classList.add('opacity-0', 'translate-y-4'), 4000);
        setTimeout(() => toast.remove(), 5000);
    }
}

export const performanceManager = new PerformanceManager();

// Expose for debugging

