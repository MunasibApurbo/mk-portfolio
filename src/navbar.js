export function initNavbar() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    // Mobile Menu Logic
    const menuBtn = document.getElementById('mobile-menu-btn');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    let isMenuOpen = false;

    if (menuBtn && menuOverlay) {
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            toggleMenu();
        });

        const closeBtn = document.getElementById('mobile-menu-close');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                isMenuOpen = false;
                toggleMenu();
            });
        }

        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                isMenuOpen = false;
                toggleMenu();
            });
        });

        function toggleMenu() {
            if (isMenuOpen) {
                // Open Menu
                menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                document.body.style.overflow = 'hidden'; // Lock scroll

                // Hide Button (No Cross Option)
                menuBtn.classList.add('opacity-0', 'pointer-events-none');

                // Animate Links In (Staggered)
                mobileLinks.forEach((link, index) => {
                    setTimeout(() => {
                        link.classList.remove('translate-y-8', 'opacity-0');
                    }, 100 + (index * 100)); // 100ms initial delay + 100ms stagger
                });

            } else {
                // Close Menu
                menuOverlay.classList.add('opacity-0', 'pointer-events-none');
                document.body.style.overflow = ''; // Unlock scroll

                // Show Button (Hamburger)
                menuBtn.classList.remove('opacity-0', 'pointer-events-none');

                // Reset Links Out
                mobileLinks.forEach(link => {
                    link.classList.add('translate-y-8', 'opacity-0');
                });
            }
        }
    }

    function updateNavStyle() {
        const logo = document.getElementById('nav-logo');
        // menuBtn is already defined above

        if (window.innerWidth < 768) {
            // Mobile: Clear (Transparent) Navbar Container
            nav.classList.remove('bg-dark-950', 'bg-dark-950/70', 'backdrop-blur-md', 'border-b', 'border-white/10');

            // Icon Background Logic (Past Hero) - Optional styling for visibility
            if (window.scrollY > window.innerHeight) {
                // Hide Logo to clean up header if desired, or keep it.
                // Current logic hides logo.
                if (logo) {
                    logo.classList.add('opacity-0', 'pointer-events-none');
                }
                // Ensure button is visible (add background if needed for contrast)
                if (menuBtn) {
                    // logic to add background to button if needed
                }
            } else {
                // Show Logo
                if (logo) {
                    logo.classList.remove('opacity-0', 'pointer-events-none');
                }
            }

        } else {
            // Desktop: Scroll effect for Navbar Container
            nav.classList.remove('bg-dark-950', 'backdrop-blur-md', 'border-b', 'border-white/5', 'shadow-lg');
            nav.classList.add('border-none', 'shadow-none');

            if (logo) {
                logo.classList.remove('opacity-0', 'pointer-events-none');
            }
        }
    }

    window.addEventListener('scroll', updateNavStyle);
    window.addEventListener('resize', updateNavStyle);
    updateNavStyle(); // Initial check
}
