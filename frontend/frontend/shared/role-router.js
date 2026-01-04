const RoleRouter = {
    routes: {
        'ADMIN': 'dashboards/admin-dashboard.html',
        'TOURIST': 'dashboards/tourism-dashboard.html',
        'STUDENT': 'dashboards/student-dashboard.html',
        'JOB_APPLICANT': 'dashboards/job-dashboard.html',
        'BUSINESS_USER': 'dashboards/business-dashboard.html'
    },

    getDashboardUrl(role) {
        if (!role || !this.routes[role]) {
            console.error('Unknown role:', role);
            return 'auth/login.html';
        }
        return this.routes[role];
    },

    redirect(role) {
        const url = this.getDashboardUrl(role);
        // Assuming we are at frontend/index.html or auth/login.html
        // We need to resolve the path correctly. 
        // Best reference is from the 'frontend' root.

        const pathSegments = window.location.pathname.split('/');
        const frontendIndex = pathSegments.indexOf('frontend');
        let baseUrl = '';
        if (frontendIndex !== -1) {
            baseUrl = pathSegments.slice(0, frontendIndex + 1).join('/');
        }

        window.location.href = `${baseUrl}/${url}`;
    }
};
