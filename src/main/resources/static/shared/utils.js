// Utility functions

const Utils = {
    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    },

    getCurrentUser() {
        return {
            token: localStorage.getItem('token'),
            role: localStorage.getItem('role')
        };
    },

    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
