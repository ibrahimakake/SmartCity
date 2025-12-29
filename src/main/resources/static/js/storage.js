// Storage utility for handling localStorage operations

const TOKEN_KEY = 'smartcity_token';
const USER_KEY = 'smartcity_user';

/**
 * Save authentication token to localStorage
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
    try {
        localStorage.setItem(TOKEN_KEY, token);
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

/**
 * Retrieve authentication token from localStorage
 * @returns {string|null} JWT token or null if not found
 */
export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error getting token:', error);
        return null;
    }
};

/**
 * Remove authentication token from localStorage
 */
export const removeToken = () => {
    try {
        localStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error removing token:', error);
    }
};

/**
 * Save user data to localStorage
 * @param {object} user - User data object
 */
export const saveUser = (user) => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
};

/**
 * Retrieve user data from localStorage
 * @returns {object|null} User data object or null if not found
 */
export const getUser = () => {
    try {
        const user = localStorage.getItem(USER_KEY);
        return user ? JSON.parse(user) : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
};

/**
 * Remove user data from localStorage
 */
export const removeUser = () => {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error('Error removing user data:', error);
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if token exists, false otherwise
 */
export const isAuthenticated = () => {
    return !!getToken();
};

/**
 * Check if user has required role
 * @param {string} requiredRole - Required role to check
 * @returns {boolean} True if user has the required role, false otherwise
 */
export const hasRole = (requiredRole) => {
    const user = getUser();
    return user && user.role === requiredRole;
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
    removeToken();
    removeUser();
};

/**
 * Get authorization header with token
 * @returns {object} Headers object with Authorization header
 */
export const getAuthHeader = () => {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};
