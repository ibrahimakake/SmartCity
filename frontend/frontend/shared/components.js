const Components = {
    // Helper to determine relative path to root based on current location
    getRootPath() {
        const path = window.location.pathname;

        // Si on est dans un sous-dossier, on remonte d'un niveau
        if (path.includes('/auth/')) return '../';
        if (path.includes('/dashboards/')) return '../';
        if (path.includes('/modules/')) return '../';
        if (path.includes('/map/')) return '../';

        // Sinon on est à la racine
        return '';
    },

    renderNavbar(activeItem = '') {
        const root = this.getRootPath();
        const role = localStorage.getItem('role');
        const isLoggedIn = !!localStorage.getItem('token');

        const path = window.location.pathname;

        let rightSideHtml = '';

        if (isLoggedIn) {
            const isAuthPage = path.includes('/auth/');

            if (!isAuthPage) {
                const getDashboardUrl = (userRole) => {
                    const map = {
                        'ADMIN': 'dashboards/admin-dashboard.html',
                        'TOURIST': 'dashboards/tourism-dashboard.html',
                        'STUDENT': 'dashboards/student-dashboard.html',
                        'JOB_APPLICANT': 'dashboards/job-dashboard.html',
                        'BUSINESS_USER': 'dashboards/business-dashboard.html'
                    };
                    return map[userRole] || 'index.html';
                };

                const dashboardUrl = getDashboardUrl(role);

                rightSideHtml = `
                    <div class="nav-user-actions" style="display: flex; gap: 10px; align-items: center;">
                        <a href="${root}${dashboardUrl}" class="btn btn-primary btn-sm">Dashboard</a>
                        <button onclick="Components.logout('${root}')" class="btn btn-danger btn-sm">Logout</button>
                    </div>
                `;
            }
        } else {
            const isAuthPage = path.includes('login.html') || path.includes('register.html');

            if (!isAuthPage) {
                rightSideHtml = `
                    <div class="nav-links">
                        <a href="${root}auth/login.html" class="btn btn-secondary" style="border:none; background:transparent;">Login</a>
                        <a href="${root}auth/register.html" class="btn btn-primary" style="padding: 8px 20px;">Register</a>
                    </div>
                `;
            }
        }

        const navHtml = `
             <nav class="navbar">
                <div class="container">
                    <a href="${root}index.html" class="nav-brand">
                        <img src="${root}assets/images/logo.png" alt="SmartCity Logo" onerror="this.style.display='none'">
                        SMART CITY
                    </a>
                    <div class="nav-links central-nav">
                        <a href="${root}index.html" class="${activeItem === 'Home' ? 'active' : ''}">Home</a>
                        <a href="${root}about.html" class="${activeItem === 'About' ? 'active' : ''}">About</a>
                        <a href="${root}contact.html" class="${activeItem === 'Contact' ? 'active' : ''}">Contact</a>
                    </div>
                    ${rightSideHtml}
                </div>
            </nav>
        `;

        // Remove existing navbar if any (to prevent duplicates)
        const oldNav = document.querySelector('nav');
        if (oldNav) oldNav.remove();

        document.body.insertAdjacentHTML('afterbegin', navHtml);
    },

    renderHero(title, subtitle) {
        return `
            <section class="dashboard-hero text-center">
                <h1>${title}</h1>
                <p>${subtitle}</p>
            </section>
        `;
    },

    logout(rootPath) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = `${rootPath}auth/login.html`;
    }
};

// Global Exposure
window.logout = function () {
    Components.logout(Components.getRootPath());
};

// Debugging helper (à supprimer en production)
console.log('Current path:', window.location.pathname);
console.log('Root path calculated:', Components.getRootPath());