(function () {
    const token = localStorage.getItem('token');
    const publicPages = ['/frontend/index.html', '/frontend/auth/login.html', '/frontend/auth/register.html', '/frontend/about.html', '/frontend/contact.html'];

    // Check if the current path is NOT a public page
    const isPublic = publicPages.some(page => window.location.pathname.endsWith(page));

    // Debugging
    console.log('AuthGuard Check:', { path: window.location.pathname, isPublic, token: !!token, role });

    // Role-Based Access Control (RBAC)
    const role = localStorage.getItem('role');
    const path = window.location.pathname;

    // Define restricted paths
    const isAdminPage = path.includes('admin-') || path.endsWith('users.html');

    if (!token && !isPublic) {
        console.warn('AuthGuard: No token found, redirecting to login.');
        redirectToLogin();
    } else if (token && !isPublic) {
        // User is logged in, check role authorization
        if (isAdminPage && role !== 'ADMIN') {
            console.warn('AuthGuard: Unauthorized access to Admin page by', role);
            redirectToDashboard(role);
        }
    }

    function redirectToLogin() {
        // Robust absolute path attempt (works if serving from root of repo)
        const pathSegments = window.location.pathname.split('/');
        const frontendIndex = pathSegments.indexOf('frontend');
        if (frontendIndex !== -1) {
            const rootPath = pathSegments.slice(0, frontendIndex + 1).join('/');
            window.location.href = `${rootPath}/auth/login.html`;
        } else {
            // Fallback
            window.location.href = '../auth/login.html';
        }
    }

    function redirectToDashboard(userRole) {
        const pathSegments = window.location.pathname.split('/');
        const frontendIndex = pathSegments.indexOf('frontend');
        let rootPath = '..'; // Fallback

        if (frontendIndex !== -1) {
            rootPath = pathSegments.slice(0, frontendIndex + 1).join('/');
        }

        const map = {
            'ADMIN': '/dashboards/admin-dashboard.html',
            'TOURIST': '/dashboards/tourism-dashboard.html',
            'STUDENT': '/dashboards/student-dashboard.html',
            'JOB_APPLICANT': '/dashboards/job-dashboard.html',
            'BUSINESS_USER': '/dashboards/business-dashboard.html'
        };

        const dashPath = map[userRole] || '/auth/login.html';
        // Construct full path. dashPath already has leading slash if mapped correctly? 
        // Actually map values should probably be relative if I use rootPath + ...
        // Let's ensure clean pathing.

        window.location.href = `${rootPath}${dashPath}`;
    }
})();
