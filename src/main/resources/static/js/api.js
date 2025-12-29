import { getAuthHeader } from './storage.js';

const API_BASE_URL = 'http://localhost:8080';

/**
 * Generic API request function
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @param {object} data - Request body data
 * @param {boolean} auth - Whether to include auth header
 * @returns {Promise<object>} Response data
 */
const apiRequest = async (endpoint, method = 'GET', data = null, auth = true) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(auth ? getAuthHeader() : {})
    };

    const config = {
        method,
        headers,
        credentials: 'include', // Important for cookies if using them
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, config);
        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.message || 'Something went wrong');
        }

        return responseData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// Auth API
export const authApi = {
    login: (credentials) => apiRequest('/auth/login', 'POST', credentials, false),
    register: (userData) => apiRequest('/auth/register', 'POST', userData, false),
    getProfile: () => apiRequest('/auth/me'),
    updateProfile: (userData) => apiRequest('/auth/me', 'PUT', userData),
    changePassword: (passwords) => apiRequest('/auth/change-password', 'POST', passwords),
};

// Tourism API
export const tourismApi = {
    // Hotels
    getHotels: () => apiRequest('/api/hotels'),
    getHotel: (id) => apiRequest(`/api/hotels/${id}`),
    createHotel: (hotelData) => apiRequest('/api/hotels', 'POST', hotelData),
    updateHotel: (id, hotelData) => apiRequest(`/api/hotels/${id}`, 'PUT', hotelData),
    deleteHotel: (id) => apiRequest(`/api/hotels/${id}`, 'DELETE'),
    
    // Hotel Bookings
    getHotelBookings: () => apiRequest('/api/hotel-bookings'),
    bookHotel: (bookingData) => apiRequest('/api/hotel-bookings', 'POST', bookingData),
    cancelHotelBooking: (id) => apiRequest(`/api/hotel-bookings/${id}/cancel`, 'POST'),
    
    // Restaurants
    getRestaurants: () => apiRequest('/api/restaurants'),
    getRestaurant: (id) => apiRequest(`/api/restaurants/${id}`),
    
    // Restaurant Reservations
    getRestaurantReservations: () => apiRequest('/api/restaurant-reservations'),
    createRestaurantReservation: (reservationData) => 
        apiRequest('/api/restaurant-reservations', 'POST', reservationData),
    cancelRestaurantReservation: (id) => 
        apiRequest(`/api/restaurant-reservations/${id}/cancel`, 'POST'),
    
    // Attractions
    getAttractions: () => apiRequest('/api/attractions'),
    getAttraction: (id) => apiRequest(`/api/attractions/${id}`),
};

// Student API
export const studentApi = {
    getCourses: () => apiRequest('/api/student/courses'),
    enrollCourse: (courseId) => apiRequest(`/api/student/courses/${courseId}/enroll`, 'POST'),
    getEnrolledCourses: () => apiRequest('/api/student/my-courses'),
    getAssignments: (courseId) => apiRequest(`/api/student/courses/${courseId}/assignments`),
    submitAssignment: (assignmentId, submissionData) =>
        apiRequest(`/api/student/assignments/${assignmentId}/submit`, 'POST', submissionData),
};

// Job API
export const jobApi = {
    getJobListings: (filters = {}) => 
        apiRequest(`/api/jobs?${new URLSearchParams(filters).toString()}`),
    getJobDetails: (id) => apiRequest(`/api/jobs/${id}`),
    applyForJob: (jobId, applicationData) =>
        apiRequest(`/api/jobs/${jobId}/apply`, 'POST', applicationData),
    getMyApplications: () => apiRequest('/api/jobs/my-applications'),
    getCompanyJobs: (companyId) => apiRequest(`/api/companies/${companyId}/jobs`),
};

// Business API
export const businessApi = {
    // Company Profile
    getMyCompany: () => apiRequest('/api/business/company'),
    updateCompany: (companyData) => apiRequest('/api/business/company', 'PUT', companyData),
    
    // Job Postings
    getPostedJobs: () => apiRequest('/api/business/jobs'),
    createJobPosting: (jobData) => apiRequest('/api/business/jobs', 'POST', jobData),
    updateJobPosting: (id, jobData) => apiRequest(`/api/business/jobs/${id}`, 'PUT', jobData),
    deleteJobPosting: (id) => apiRequest(`/api/business/jobs/${id}`, 'DELETE'),
    getJobApplicants: (jobId) => apiRequest(`/api/business/jobs/${jobId}/applicants`),
    updateApplicationStatus: (applicationId, statusData) =>
        apiRequest(`/api/business/applications/${applicationId}/status`, 'PATCH', statusData),
    
    // Business Listings
    getMyListings: () => apiRequest('/api/business/listings'),
    createListing: (listingData) => apiRequest('/api/business/listings', 'POST', listingData),
    updateListing: (id, listingData) => 
        apiRequest(`/api/business/listings/${id}`, 'PUT', listingData),
    deleteListing: (id) => apiRequest(`/api/business/listings/${id}`, 'DELETE'),
};

// Map API
export const mapApi = {
    // Get all points of interest with optional filters
    getPointsOfInterest: (filters = {}) =>
        apiRequest(`/api/map/poi?${new URLSearchParams(filters).toString()}`),
        
    // Get details of a specific point of interest
    getPointOfInterest: (id) => apiRequest(`/api/map/poi/${id}`),
    
    // Search for locations by name or type
    searchLocations: (query, filters = {}) =>
        apiRequest(`/api/map/search?q=${encodeURIComponent(query)}&${new URLSearchParams(filters).toString()}`),
    
    // Get directions between two points
    getDirections: (from, to, mode = 'driving') =>
        apiRequest(`/api/map/directions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&mode=${mode}`),
    
    // Report a new point of interest
    reportPOI: (poiData) => apiRequest('/api/map/poi', 'POST', poiData),
};

// Admin API
export const adminApi = {
    // User Management
    getAllUsers: () => apiRequest('/api/admin/users'),
    getUser: (userId) => apiRequest(`/api/admin/users/${userId}`),
    updateUser: (userId, userData) => apiRequest(`/api/admin/users/${userId}`, 'PUT', userData),
    deleteUser: (userId) => apiRequest(`/api/admin/users/${userId}`, 'DELETE'),
    
    // Content Moderation
    getReportedContent: () => apiRequest('/api/admin/reported-content'),
    moderateContent: (contentId, action) => 
        apiRequest(`/api/admin/moderate/${contentId}`, 'POST', { action }),
    
    // System Settings
    getSystemStats: () => apiRequest('/api/admin/stats'),
    updateSystemSettings: (settings) => 
        apiRequest('/api/admin/settings', 'PUT', settings),
    
    // Backup & Maintenance
    createBackup: () => apiRequest('/api/admin/backup', 'POST'),
    getBackups: () => apiRequest('/api/admin/backups'),
    restoreBackup: (backupId) => apiRequest(`/api/admin/backups/${backupId}/restore`, 'POST'),
};

// Export all APIs
export default {
    auth: authApi,
    tourism: tourismApi,
    student: studentApi,
    job: jobApi,
    business: businessApi,
    map: mapApi,
    admin: adminApi,
};
