/**
 * Sidebar Toggle Logic
 * Handles the expansion and collapse of sidebar submenus.
 */
document.addEventListener('DOMContentLoaded', () => {
    const submenuParents = document.querySelectorAll('.sidebar-menu li.has-submenu');

    submenuParents.forEach(parent => {
        const link = parent.querySelector('a');

        link.addEventListener('click', (e) => {
            // Prevent default only if clicking the parent link (not the submenu items)
            if (e.target.closest('ul.submenu')) return;

            e.preventDefault();

            // Close other open submenus (optional, for accordion effect)
            submenuParents.forEach(p => {
                if (p !== parent) p.classList.remove('open');
            });

            // Toggle current
            parent.classList.toggle('open');
        });
    });
});
