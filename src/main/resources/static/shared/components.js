const Components = {
    // Helper to determine relative path to root based on current location
    getRootPath() {
        const path = window.location.pathname;

        // Check deeper nesting first
        if (path.includes('/modules/tourism/') || path.includes('/modules/student/') || path.includes('/modules/job/') || path.includes('/modules/business/')) return '../../';

        // Si on est dans un sous-dossier, on remonte d'un niveau
        if (path.includes('/auth/')) return '../';
        if (path.includes('/dashboards/')) return '../';
        if (path.includes('/modules/')) return '../';
        if (path.includes('/map/')) return '../';

        // Sinon on est à la racine
        return '';
    },

    renderNavbar(activeItem = '') {
        console.log('Rendering Navbar 2026...');
        const root = this.getRootPath();
        const role = localStorage.getItem('role');
        const isLoggedIn = !!localStorage.getItem('token');
        const path = window.location.pathname;

        // --- 1. DYNAMIC CSS INJECTION (Performance & 2026 Visuals) ---
        if (!document.getElementById('navbar-styles')) {
            const styleCheck = document.createElement('style');
            styleCheck.id = 'navbar-styles';
            styleCheck.innerHTML = `
                /* 2026 Frosted Glass Navbar */
                .navbar-2026 {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 90%;
                    max-width: 1000px;
                    background: rgba(255, 255, 255, 0.02); /* Ultra-subtle tint */
                    backdrop-filter: blur(15px); /* Adjusted to 15px */
                    -webkit-backdrop-filter: blur(15px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 50px;
                    padding: 10px 30px;
                    z-index: 10000;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                
                .nav-brand-2026 {
                    display: flex;
                    align-items: center;
                    text-decoration: none;
                }

                .nav-brand-2026 img {
                    height: 35px;
                    transition: transform 0.3s ease;
                }

                .nav-brand-2026:hover img {
                    transform: scale(1.1) rotate(-5deg);
                }

                .nav-links-center {
                    display: flex;
                    gap: 30px;
                }

                .nav-link-item {
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 0.95rem;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    position: relative;
                }

                .nav-link-item:hover {
                    color: white;
                }

                .nav-link-item::after {
                    content: '';
                    position: absolute;
                    width: 0;
                    height: 2px;
                    bottom: -4px;
                    left: 50%;
                    background: #00f2fe;
                    transition: all 0.3s ease;
                    transform: translateX(-50%);
                }

                .nav-link-item:hover::after {
                    width: 100%;
                }

                .btn-nav-action {
                    border-radius: 30px;
                    padding: 10px 24px;
                    font-weight: 700;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: all 0.3s ease;
                    display: inline-block;
                }

                .btn-nav-ghost {
                    color: white;
                    background: transparent;
                }
                
                .btn-nav-ghost:hover {
                    color: #00f2fe;
                    transform: scale(1.05);
                }

                .btn-nav-primary {
                    background: white;
                    color: #0b1120;
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
                }

                .btn-nav-primary:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(255, 255, 255, 0.4);
                    background: #f8fafc;
                }

                @media (max-width: 768px) {
                    .nav-links-center { display: none; }
                    .navbar-2026 { width: 95%; padding: 10px 20px; }
                }
            `;
            document.head.appendChild(styleCheck);
        }

        let centerHtml = '';
        let rightSideHtml = '';

        // --- CONTEXT DETECTION ---
        const isLoginPage = path.includes('login.html');
        const isRegisterPage = path.includes('register.html');
        // Simple check for home page (root or index.html) - assuming root path ends in / or index.html
        const isHomePage = path.endsWith('/') || path.endsWith('index.html');
        const isAuthPage = isLoginPage || isRegisterPage;
        const isDashboard = path.includes('/dashboards/');
        const isTourismModule = path.includes('modules/tourism/');
        const isStudentModule = path.includes('modules/student/');
        const isJobModule = path.includes('modules/job/');
        const isBusinessModule = path.includes('modules/business/');
        console.log('Navbar Debug:', { path, isTourismModule, isStudentModule, isJobModule, isBusinessModule, isLoggedIn, isDashboard, role });

        // --- 2. AUTHENTICATED STATE (Dashboards) ---
        if ((isLoggedIn || isDashboard || isTourismModule || isStudentModule || isJobModule || isBusinessModule) && !isAuthPage) {
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

            // CASE 1: Tourism Dashboard specific navbar
            if ((role === 'TOURIST' && isDashboard && !path.includes('student-dashboard.html') && !path.includes('job-dashboard.html') && !path.includes('business-dashboard.html')) || path.includes('tourism-dashboard.html')) {
                centerHtml = `
                    <div class="nav-links-center">
                        <a href="#map-section" class="nav-link-item">Map</a>
                        <a href="#categories-section" class="nav-link-item">Categories</a>
                    </div>
                `;
                rightSideHtml = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button onclick="Components.logout('${root}')" class="btn-nav-action" style="background: rgba(239, 68, 68, 0.8); color: white; border: none; cursor: pointer;">Logout</button>
                    </div>
                `;
            }
            // CASE 2: Student Module & Job Module & Business Module (Simplified View)
            else if (isStudentModule || isJobModule || isBusinessModule || path.includes('student-dashboard.html') || path.includes('job-dashboard.html') || path.includes('business-dashboard.html')) {
                centerHtml = '';
                rightSideHtml = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button onclick="Components.logout('${root}')" class="btn-nav-action" style="background: rgba(239, 68, 68, 0.8); color: white; border: none; cursor: pointer;">Logout</button>
                    </div>
                `;
            }
            // CASE 3: Standard Authenticated View (Fallback for Tourism Pages, etc.)
            else {
                centerHtml = '';
                rightSideHtml = `
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <a href="${root}${getDashboardUrl(role)}" class="btn-nav-action btn-nav-primary">Dashboard</a>
                        <button onclick="Components.logout('${root}')" class="btn-nav-action" style="background: rgba(239, 68, 68, 0.8); color: white; border: none; cursor: pointer;">Logout</button>
                    </div>
                `;
            }
        }
        else {
            // Default Fallback (should be covered by Guest State, but kept for safety)
            // This else block was part of the original structure for non-authenticated or different states
            // But valid "Guest State" is handled in point 3 below properly.
            // We can leave this empty or minimal if not reached, but based on original code logic:
            // It seems original code structure was: if(auth) { ... } else { ... }
            // But point 3 "GUEST STATE" is actually an "else if" logic or separate check?
            // Looking at file, Point 3 starts with "else {" relative to "if (isLoggedIn...)"?
            // Actually, looking at the previous file structure:
            // if (auth) { ... } else { // GUEST STATE }
            // Let's assume the "else" block corresponds to the GUEST state.

            if (isLoginPage) {
                // LOGIN PAGE
                centerHtml = '';
                rightSideHtml = `
                        <div style="display: flex; align-items: center; gap: 15px; color: white;">
                            <span style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">New here?</span>
                            <a href="register.html" class="btn-nav-action btn-nav-primary">Register</a>
                        </div>
                    `;
            } else if (isRegisterPage) {
                // REGISTER PAGE
                centerHtml = '';
                rightSideHtml = `
                        <div style="display: flex; align-items: center; gap: 15px; color: white;">
                            <span style="font-size: 0.9rem; color: rgba(255,255,255,0.6);">Already a member?</span>
                            <a href="login.html" class="btn-nav-action btn-nav-ghost">Login</a>
                        </div>
                    `;
            } else {
                // HOME / DEFAULT GUEST PAGE
                centerHtml = `
                        <div class="nav-links-center">
                            <a href="${root}index.html#solution" class="nav-link-item">Features</a>
                            <a href="${root}index.html#expertise" class="nav-link-item">Expertise</a>
                            <a href="${root}index.html#modules" class="nav-link-item">Modules</a>
                        </div>
                    `;
                rightSideHtml = `
                         <div style="display: flex; gap: 10px; align-items: center;">
                            <a href="${root}auth/login.html" class="btn-nav-action btn-nav-ghost">Login</a>
                            <a href="${root}index.html#contact" class="btn-nav-action btn-nav-primary">Get Started</a>
                        </div>
                    `;
            }
        }

        const navHtml = `
             <nav class="navbar-2026">
                <a href="${root}index.html" class="nav-brand-2026">
                    <img src="${root}assets/images/logo.svg" alt="SmartCity" onerror="this.style.display='none'">
                </a>
                
                ${centerHtml}
                ${rightSideHtml}
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