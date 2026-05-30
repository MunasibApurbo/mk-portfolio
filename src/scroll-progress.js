/**
 * Scroll Progress Bar
 * Updates the width of the progress bar based on the scroll position.
 */

// Export only
export const initScrollProgress = () => {
    const progressBar = document.getElementById('scroll-progress');

    if (!progressBar) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (scrollTop / height) * 100;

        progressBar.style.width = `${scrolled}%`;
    };

    // Update on scroll
    window.addEventListener('scroll', updateProgress);

    // Initial update
    updateProgress();
};
