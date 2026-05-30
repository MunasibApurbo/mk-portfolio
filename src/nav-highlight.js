/**
 * Navigation Highlight
 * Highlights the active nav link based on scroll position
 * Works with both vertical scroll and horizontal scroll sections
 */

export function initNavHighlight() {
    const navLinks = document.querySelectorAll('.nav-link');

    // Section scroll position thresholds
    // Adjusted based on the page structure:
    // - Hero: 0 to transition-track start
    // - Work: transition-track (horizontal scroll area)
    // - Profile: after transition-track to footer
    // - Contact: footer area

    function updateActiveNav() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // Get key element positions
        const transitionTrack = document.getElementById('transition-track');
        const profileSection = document.getElementById('profile');
        const footerSpacer = document.querySelector('.h-\\[35vh\\]');

        let activeId = 'hero-page'; // Default to home

        if (transitionTrack && profileSection) {
            const trackTop = transitionTrack.offsetTop;
            const trackHeight = transitionTrack.offsetHeight;
            const trackEnd = trackTop + trackHeight;
            const profileTop = profileSection.offsetTop;

            // Determine active section based on scroll position
            if (scrollY < trackTop + windowHeight * 0.3) {
                // Hero section - before entering transition track significantly
                activeId = 'hero-page';
            } else if (scrollY < trackEnd - windowHeight * 0.5) {
                // Work section - inside transition track (includes bento grid + spotlight)
                activeId = 'work-grid';
            } else if (scrollY < docHeight - windowHeight * 1.5) {
                // Profile section - after transition track until near footer
                activeId = 'profile-view';
            } else {
                // Contact - near bottom of page (footer area)
                activeId = 'contact';
            }
        }

        // Update nav link classes
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === `#${activeId}`) {
                link.classList.add('active-nav');
            } else {
                link.classList.remove('active-nav');
            }
        });
    }

    // Initial update
    updateActiveNav();

    // Update on scroll (throttled)
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNav();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Update on resize
    window.addEventListener('resize', updateActiveNav);
}
