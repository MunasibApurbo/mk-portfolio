
export function initAwardsInteraction() {
    const awardsTab = document.getElementById('awards-tab');
    if (!awardsTab) return;

    // Use event delegation or select direct children cards
    // The structure is: #awards-tab > .group.tilt-card
    const cards = awardsTab.querySelectorAll('.group');

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            // Prevent interference if clicking logic needs to check target
            // But for now, toggling the card itself is fine.

            // Toggle 'expanded' class on the card parent
            card.classList.toggle('expanded');
        });
    });
}
