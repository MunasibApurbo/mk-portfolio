import './style.css';
import { initNavHighlight } from './nav-highlight.js';
import { initAnimations } from './animations.js';
import { initCursor } from './cursor.js';
import { initTiltEffect } from './tilt-effect.js';
import { initNavbar } from './navbar.js';
import { initScrollProgress } from './scroll-progress.js';
import { initKineticType } from './kinetic-type.js';
import { initSectionParticles } from './section-particles.js';
import { initCursorTrail } from './cursor-trail.js';
import { initScrollAnimations } from './scroll-animations.js';
import { initAwardsInteraction } from './awards-interaction.js';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';


import { performanceManager } from './performance-manager.js';

// Initialize Smooth Scroll
const lenis = new Lenis({
    duration: 1.5, // Awwwards Standard: Heavy, cinematic, floaty
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1, // Standard speed (forces slow, deliberate viewing)
    smoothTouch: false,
    touchMultiplier: 2,
});

// Performance Listener for Global Settings
performanceManager.onChange((mode) => {
    if (mode === 'EFFICIENCY') {
        // Reduce load on scroll
        gsap.ticker.lagSmoothing(1000, 16);
    } else {
        // Cinematic Smoothness
        gsap.ticker.lagSmoothing(0);
    }
});

initAwardsInteraction();

// Initialize Kinetic Typography
initKineticType(lenis);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Page Transition
    const initPageTransition = () => {
        const tl = gsap.timeline();

        // Initial State
        gsap.set("#preloader", { autoAlpha: 1 });

        // Initialize effects
        initNavHighlight();
        initCursor();
        initCursorTrail(); // Awwwards: Glowing cursor trail
        initTiltEffect(); // Enable 3D Tilt
        initNavbar(); // Initialize Navbar Logic
        initScrollProgress(); // Initialize Scroll Progress Bar

        // Animation Sequence
        const loaderTextChars = document.querySelectorAll(".loader-text-char");
        if (loaderTextChars.length) {
            tl.to(loaderTextChars, {
                yPercent: -100,
                duration: 1.0,
                ease: "power4.inOut",
            });
        }

        tl.to('.preloader-layer.accent', {
            yPercent: -100,
            duration: 0.8,
            ease: "power2.inOut",
        })
            .to('.preloader-layer.base', {
                yPercent: -100,
                duration: 1.0,
                ease: "power4.inOut",
            }, "-=0.8") // Base layer follows slightly after
            .from('#hero-video', {
                scale: 1.2,
                duration: 1.5,
                ease: "power2.out"
            }, "-=0.8")
            .from('#hero-content span', {
                y: 100,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
                onComplete: () => {
                    document.body.style.overflow = '';
                }
            }, "-=1.0");
    };

    // Main Logic
    const isMobile = window.innerWidth < 768;

    // Immediately Load Page (Non-blocking)
    initPageTransition();

    // Defer non-critical visuals to unblock main thread
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setTimeout(() => {
        initAnimations();
        initCursor();
        if (!prefersReducedMotion) {
            initSectionParticles();
        }
        initScrollAnimations();
    }, 100);

    // Initialize Navigation
    initNavHighlight();

    if (!isMobile) {
        // DESKTOP: Load rover immediately (model is only ~1.3MB after texture stripping)
        // No deferral needed — instant load for best UX
        const statusText = document.getElementById('loader-status');
        if (statusText) statusText.innerText = "ESTABLISHING UPLINK...";

        import('./rover-scene.js').then(module => {
            module.initRoverScene();
        });

        // Lazy load awards particles on interaction (less critical)
        let awardsLoaded = false;
        const loadAwardsParticles = () => {
            if (awardsLoaded) return;
            awardsLoaded = true;
            ['scroll', 'mousemove', 'touchstart', 'click'].forEach(evt =>
                window.removeEventListener(evt, loadAwardsParticles)
            );
            const requestIdle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
            requestIdle(() => {
                import('./awards-particles.js').then(m => m.initAwardsParticles());
            }, { timeout: 2000 });
        };

        ['scroll', 'mousemove', 'touchstart', 'click'].forEach(evt =>
            window.addEventListener(evt, loadAwardsParticles, { once: true, passive: true })
        );
        setTimeout(loadAwardsParticles, 3500);

        // Listen for Rover Progress (Local Loader)
        window.addEventListener('rover-progress', (e) => {
            const progress = e.detail.progress;
            const bar = document.getElementById('game-loader-bar'); // Updated ID
            const text = document.getElementById('loader-status'); // Updated ID

            if (bar) bar.style.width = `${progress}%`;
            if (text) text.innerText = `DOWNLOADING ASSETS... ${Math.round(progress)}%`;
        });

        // Hide Local Loader when Done
        window.addEventListener('rover-loaded', () => {
            document.body.classList.add('assets-ready');
        });

    } else {
        // MOBILE: Skip heavy 3D scenes
    }

    // Lazy Load Timeline (Journey)
    let timelineLoaded = false;
    const loadTimeline = () => {
        if (timelineLoaded) return;
        timelineLoaded = true;
        import('./tree-timeline.js').then(module => module.initTreeTimeline());
    };

    const timelineContainer = document.getElementById('timeline-container');
    if (timelineContainer) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                loadTimeline();
                observer.disconnect();
            }
        }, { rootMargin: "200px" });
        observer.observe(timelineContainer);
    } else {
        // Fallback if container not found
        setTimeout(loadTimeline, 2000);
    }


    // Lazy Load Teaching Areas (Expertise)
    let teachingLoaded = false;
    const loadTeaching = () => {
        if (teachingLoaded) return;
        teachingLoaded = true;
        import('./teaching-areas.js').then(module => module.initTeachingAreas());
    };

    if (window.innerWidth >= 768) {
        const teachingContainer = document.getElementById('teaching-canvas-container');
        if (teachingContainer) {
            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    loadTeaching();
                    observer.disconnect();
                }
            }, { rootMargin: "200px" });
            observer.observe(teachingContainer);
        } else {
            setTimeout(loadTeaching, 2000);
        }
    } else {
        // Mobile Page Logic (No 3D canvas, just carousel logic)
        // Ensure this logic runs only when needed or immediately if lightweight
        const carousel = document.querySelector('.snap-x');
        const dots = document.querySelectorAll('#teaching-dots div');

        if (carousel && dots.length > 0) {
            carousel.addEventListener('scroll', () => {
                const scrollLeft = carousel.scrollLeft;
                const cardWidth = carousel.firstElementChild.offsetWidth + 24; // Width + gap (approx)

                const index = Math.round(scrollLeft / cardWidth);

                dots.forEach((dot, i) => {
                    if (i === index) {
                        dot.classList.remove('bg-white/20');
                        dot.classList.add('bg-white');
                    } else {
                        dot.classList.remove('bg-white');
                        dot.classList.add('bg-white/20');
                    }
                });
            }, { passive: true });
        }
    }


    // Handle Anchor Links with Lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Ignore empty anchors

            // Special navigation for horizontal scroll sections
            if (targetId === '#hero-page') {
                // Hero is at the very top
                lenis.scrollTo(0, { duration: 1.5 });
                return;
            }

            if (targetId === '#work-grid') {
                // Work Grid is within the horizontal scroll track
                // We need to scroll to a position where the bento grid is fully visible
                const transitionTrack = document.getElementById('transition-track');
                if (transitionTrack) {
                    const trackTop = transitionTrack.offsetTop;
                    // Scroll to ~2.5 viewport heights into the track for full bento grid view
                    lenis.scrollTo(trackTop + window.innerHeight * 2.5, { duration: 1.5 });
                }
                return;
            }

            if (targetId === '#profile-view') {
                // Profile section - scroll to the actual profile section element
                const profileSection = document.getElementById('profile');
                if (profileSection) {
                    lenis.scrollTo(profileSection, { duration: 1.5 });
                }
                return;
            }

            if (targetId === '#contact' || targetId === '#nav-contact') {
                // Footer is fixed (Curtain Reveal), so we scroll to the very bottom
                lenis.scrollTo(document.body.scrollHeight, { duration: 1.5 });
                return;
            }

            // Standard navigation for other sections
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                lenis.scrollTo(targetElement, { duration: 1.5 });
            }
        });
    });

    // Force Video Play
    const heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        heroVideo.play().catch(error => {

        });
    }
    // Dynamic Copyright Year
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Contact Modal Logic
    const contactWrapper = document.getElementById('contact-form-wrapper');
    const closeContact = document.getElementById('close-contact');
    const triggers = document.querySelectorAll('.contact-trigger'); // Use class for multiple buttons (Nav + Footer)

    if (contactWrapper && closeContact) {

        const contactInner = document.getElementById('contact-form-inner');

        // Reusable Open Modal Function
        const openModal = () => {
            contactWrapper.classList.remove('hidden');
            setTimeout(() => {
                contactWrapper.classList.remove('opacity-0');
                if (contactInner) {
                    contactInner.classList.remove('scale-90', 'opacity-0');
                }
            }, 10);
        };

        // Attach to all triggers
        triggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        });

        document.addEventListener('click', (e) => {
            const footerTrigger = document.getElementById('contact-trigger');
            if (!footerTrigger || e.target.closest('#contact-form-wrapper')) return;

            const atPageEnd = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 8;
            if (!atPageEnd) return;

            const rect = footerTrigger.getBoundingClientRect();
            const clickedFooterTriggerArea =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (clickedFooterTriggerArea) {
                e.preventDefault();
                openModal();
            }
        });

        const closeModal = () => {
            contactWrapper.classList.add('opacity-0');
            if (contactInner) {
                contactInner.classList.add('scale-90', 'opacity-0');
            }
            setTimeout(() => {
                contactWrapper.classList.add('hidden');
            }, 500); // Match duration-500
        };

        closeContact.addEventListener('click', closeModal);

        // Close on clicking outside frame
        contactWrapper.addEventListener('click', (e) => {
            if (e.target === contactWrapper) {
                closeModal();
            }
        });
    }

});
