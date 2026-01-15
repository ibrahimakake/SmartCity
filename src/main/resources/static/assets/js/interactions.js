document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for Fade-in-up animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once visible to save resources
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Target elements with .scroll-reveal class
    const scrollElements = document.querySelectorAll('.scroll-reveal');
    scrollElements.forEach(el => observer.observe(el));
    /* ==============================
       Smart Navbar (Hide on Scroll Down)
       ============================== */
    let lastScrollY = window.scrollY;
    const navbar = document.querySelector('nav.navbar');

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Add 'scrolled' class for background opacity change
        if (currentScrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Hide on Scroll Down, Show on Scroll Up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
    });

    /* ==============================
       Explore Modal Interaction
       ============================== */
});
