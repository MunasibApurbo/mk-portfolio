import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {


    // kill default scaling issues if any
    ScrollTrigger.defaults({
        toggleActions: "play none none reverse",
        markers: false // set to true for debugging
    });

    // 2. Part 1: 3D Work -> Profile Transition
    // 3D Pan-Switch Effect: Work zooms out & slides right, Profile zooms in.
    const transitionWrapper = document.getElementById('work-profile-wrapper');
    if (transitionWrapper) {

        // Ensure initial states for simple crossfade


        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: "#transition-track",
                start: "top top",
                end: "bottom bottom",
                pin: transitionWrapper,
                pinSpacing: false,
                anticipatePin: 1,
                scrub: 1.0, // Increased to 1.0 for cinematic, floaty response
                invalidateOnRefresh: true, // IMPORTANT: Recalculate values on resize/refresh
            }
        });

        // Step 0: Horizontal Scroll of Work Content
        const workContent = document.getElementById("work-content");

        // Default scroll offset
        let scrollOffset = 0;

        // Function to calculate horizontal scroll needed
        const updateScrollOffset = () => {
            if (workContent) {
                const totalWidth = workContent.scrollWidth;
                const viewWidth = window.innerWidth;
                // Scroll to the end (leftward movement)
                scrollOffset = -(totalWidth - viewWidth);
            }
        };

        // Initial calculation
        updateScrollOffset();

        // Recalculate on resize (debounced via requestAnimationFrame)
        let resizeTimeoutId = null;
        window.addEventListener('resize', () => {
            if (resizeTimeoutId) {
                cancelAnimationFrame(resizeTimeoutId);
            }
            resizeTimeoutId = requestAnimationFrame(() => {
                updateScrollOffset();
                resizeTimeoutId = null;
            });
        });


        // Horizontal Scroll through Bento Grid -> Arrive at Spotlight
        // Use matchMedia to only enable this horizontal scroll on desktop
        ScrollTrigger.matchMedia({
            "(min-width: 768px)": function () {
                tl.to("#work-content", {
                    x: () => scrollOffset, // Use function-based value for responsiveness
                    ease: "none",
                    duration: 4
                });
            },
            "(max-width: 767px)": function () {
                // Mobile: No horizontal translation. Content stacks vertically via CSS.
                // We might need to ensure the pin is disabled or adjusted if the timeline handles pinning.
                // The current timeline uses #transition-track as trigger and doesn't explicitly pin here (pin: false in config),
                // but the parent container logic might rely on it.
                // Since 'pin: false' is set above, the translation moves the content. 
                // By disabling the translation, it stays static.
            }
        });






        // Force refresh after a delay to ensure images are loaded and height is correct
        setTimeout(() => ScrollTrigger.refresh(), 1000);
        setTimeout(() => ScrollTrigger.refresh(), 3000); // Backup refresh
        window.addEventListener('load', () => ScrollTrigger.refresh());
    }

    // 3. Teaching Section Attributes
    // Slide entire wrapper from Right (User Request) - DESKTOP ONLY
    const teachingWrapper = document.getElementById('teaching');
    if (teachingWrapper && window.innerWidth >= 768) {
        gsap.from(teachingWrapper, {
            scrollTrigger: {
                trigger: "#teaching",
                start: "top 75%",
                end: "top 20%",
                scrub: 1,
            },
            x: 200, // Slide from RIGHT
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        });
    }

    // Mobile Cards Stagger (Opacity/Y only) - DISABLED ON MOBILE per user request
    const teachingSection = document.getElementById('teaching');
    if (teachingSection && window.innerWidth >= 768) {
        const cards2 = teachingSection.querySelectorAll('.snap-center'); // Mobile cards

        if (cards2.length > 0) {
            gsap.from(cards2, {
                scrollTrigger: {
                    trigger: "#teaching",
                    start: "top 70%",
                },
                y: 50, // Slide up
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    }

    // 4. Awards Section Wrapper
    // Slide in from left as a giant page (matching Journey) - DESKTOP ONLY
    const awardsWrapper = document.getElementById('awards-wrapper');
    if (awardsWrapper) {
        ScrollTrigger.matchMedia({
            "(min-width: 768px)": function () {
                gsap.from(awardsWrapper, {
                    scrollTrigger: {
                        trigger: "#awards",
                        start: "top 75%",
                        end: "top 20%",
                        scrub: 1,
                    },
                    x: -200,
                    opacity: 0,
                    duration: 1.5,
                    ease: "power2.out"
                });
            }
        });
    }

    // 5. Journey / Timeline Section
    // Slide in from left as a giant page - DESKTOP ONLY
    const journey = document.getElementById('journey-wrapper');
    if (journey) {
        ScrollTrigger.matchMedia({
            "(min-width: 768px)": function () {
                // Slide from LEFT (User Request: Group coming from left just like award section)
                gsap.fromTo(journey,
                    {
                        x: -200, // From Left
                        opacity: 0
                    },
                    {
                        scrollTrigger: {
                            trigger: "#journey-wrapper", // Use wrapper ID
                            start: "top 75%",
                            end: "top 20%",
                            scrub: 1,
                        },
                        x: 0,
                        opacity: 1,
                        duration: 1.5,
                        ease: "power2.out"
                    }
                );
            }
        });
    }



    // 7. Awards Cards Scroll Reveal (Blur Effect)
    const awardCards = document.querySelectorAll('#awards-tab .tilt-card');
    awardCards.forEach((card, index) => {
        gsap.set(card, {
            opacity: 0,
            y: 50
        });

        gsap.to(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 90%", // Start earlier
                end: "top 70%",
                toggleActions: "play none none reverse",
                scrub: 0.5
            },
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out"
        });
    });
    // 8. Awwwards Premium Image Reveals (Clip-path Unroll) - DESKTOP ONLY
    const isMobile = window.innerWidth < 768;
    const revealImages = document.querySelectorAll('.reveal-image');
    revealImages.forEach(img => {
        if (isMobile) {
            // On mobile, just show the image immediately without animation
            gsap.set(img, { opacity: 1, clipPath: "inset(0% 0% 0% 0%)", scale: 1 });
            return;
        }

        // Desktop animation
        // Ensure parent has overflow hidden for scale effect
        const parent = img.parentElement;
        if (parent) {
            gsap.set(parent, { overflow: 'hidden' });
        }

        gsap.fromTo(img,
            {
                clipPath: "inset(0% 0% 100% 0%)", // Fully clipped from bottom
                scale: 1.2, // Zoomed in
                opacity: 0
            },
            {
                clipPath: "inset(0% 0% 0% 0%)", // Unclipped
                scale: 1.0, // Natural scale
                opacity: 1,
                duration: 1.5,
                ease: "power4.out", // Slow, dramatic ease
                scrollTrigger: {
                    trigger: img,
                    start: "top 85%", // Trigger when slightly visible
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // 9. Profile Header Slide-in from Right - DESKTOP ONLY
    const profileHeader = document.getElementById('profile-header');
    if (profileHeader && window.innerWidth >= 768) {
        gsap.from(profileHeader, {
            scrollTrigger: {
                trigger: "#profile",
                start: "top 80%",
                end: "top 40%",
                scrub: 1,
            },
            x: 200, // Slide from right
            opacity: 0,
            duration: 1.5,
            ease: "power2.out"
        });
    }
}
