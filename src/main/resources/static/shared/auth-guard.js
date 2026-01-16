/**
 * Authentication and Authorization Guard
 * Protects routes and handles role-based access control
 */
 console.log('AUTH-GUARD VERSION: FIXED-2024-JAN-15');
(function () {
    // Get authentication state - DECLARE ALL VARIABLES FIRST
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const path = window.location.pathname;

    // Define public pages that don't require authentication
    const publicPages = [
        '/frontend/index.html',
        '/frontend/auth/login.html',
        '/frontend/auth/register.html',
        '/frontend/about.html',
        '/frontend/contact.html'
    ];

    // Check if current page is public
    const isPublic = publicPages.some(page => path.endsWith(page));

    // Debug information
    console.log('AuthGuard Check:', {
        path: path,
        isPublic,
        hasToken: !!token,
        role: role || 'none'
    });

    // Define admin-only pages
    const isAdminPage = path.includes('admin-') || path.endsWith('users.html');

    // Authentication check
    if (!token && !isPublic) {
        console.warn('AuthGuard: No authentication token found, redirecting to login.');
        return redirectToLogin();
    }

    // Authorization check
    if (token && !isPublic) {
        // Check if user is trying to access admin page without admin role
        if (isAdminPage && role !== 'ADMIN') {
            console.warn('AuthGuard: Unauthorized access to Admin page by ' + (role || 'unauthenticated user'));
            return redirectToDashboard(role);
        }

        // Additional role-based checks can be added here
    }

    /**
     * Redirects user to login page
     */
    function redirectToLogin() {
        const pathSegments = window.location.pathname.split('/');
        const frontendIndex = pathSegments.indexOf('frontend');

        if (frontendIndex !== -1) {
            const rootPath = pathSegments.slice(0, frontendIndex + 1).join('/');
            window.location.href = rootPath + '/auth/login.html';
        } else {
            // Fallback for different directory structures
            window.location.href = '../auth/login.html';
        }
    }

    /**
     * Redirects user to their role-appropriate dashboard
     * @param {string} userRole - The user's role from localStorage
     */
    function redirectToDashboard(userRole) {
        const pathSegments = window.location.pathname.split('/');
        const frontendIndex = pathSegments.indexOf('frontend');
        let rootPath = '..'; // Fallback relative path

        if (frontendIndex !== -1) {
            rootPath = pathSegments.slice(0, frontendIndex + 1).join('/');
        }

        // Map roles to their respective dashboard paths
        const roleToPath = {
            'ADMIN': '/dashboards/admin-dashboard.html',
            'TOURIST': '/dashboards/tourism-dashboard.html',
            'STUDENT': '/dashboards/student-dashboard.html',
            'JOB_APPLICANT': '/dashboards/job-dashboard.html',
            'BUSINESS_USER': '/dashboards/business-dashboard.html'
        };

        // Get the appropriate path or default to login
        const dashPath = userRole && roleToPath[userRole]
            ? roleToPath[userRole]
            : '/auth/login.html';

        // Ensure clean URL construction
        const redirectUrl = (rootPath + dashPath).replace(/([^:]\/)\/+/g, '$1');
        console.log('AuthGuard: Redirecting to ' + redirectUrl);
        window.location.href = redirectUrl;
    }
})();