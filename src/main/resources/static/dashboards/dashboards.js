// Dashboard shared logic

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Navbar
    if (typeof Components !== 'undefined') {
        // Force 'isLoggedIn' context if on a dashboard, or ensure components renders correctly
        Components.renderNavbar();
    }

    // 2. Setup Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.card');

            cards.forEach(card => {
                const title = card.querySelector('h3').textContent.toLowerCase();
                if (title.includes(term)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    // 3. Update active state based on current page (optional)
});
