/**
 * Users API Service
 * Handles all backend interactions for User management.
 */

class UsersApi {
    constructor() {
        this.baseUrl = '/api/users';
    }

    /**
     * GET /api/users
     * @returns {Promise<Array>} List of all users
     */
    async getAll() {
        console.log('[UsersApi] GET /api/users');
        return await api.get(this.baseUrl);
    }

    /**
     * GET /api/users/{id}
     * @param {string} id - User ID
     * @returns {Promise<Object>} User details
     */
    async getById(id) {
        console.log(`[UsersApi] GET /api/users/${id}`);
        return await api.get(`${this.baseUrl}/${id}`);
    }

    /**
     * GET /api/users/email/{email}
     * @param {string} email - User email
     * @returns {Promise<Object>} User details
     */
    async getByEmail(email) {
        console.log(`[UsersApi] GET /api/users/email/${email}`);
        return await api.get(`${this.baseUrl}/email/${email}`);
    }

    /**
     * POST /api/users
     * @param {Object} user - User data to create
     * @returns {Promise<Object>} Created user
     */
    async create(user) {
        console.log('[UsersApi] POST /api/users', user);
        return await api.post(this.baseUrl, user);
    }

    /**
     * PUT /api/users/{id}
     * @param {string} id - User ID
     * @param {Object} user - Updated user data
     * @returns {Promise<Object>} Updated user
     */
    async update(id, user) {
        console.log(`[UsersApi] PUT /api/users/${id}`, user);
        return await api.put(`${this.baseUrl}/${id}`, user);
    }

    /**
     * DELETE /api/users/{id}
     * @param {string} id - User ID to delete
     * @returns {Promise<void>}
     */
    async delete(id) {
        console.log(`[UsersApi] DELETE /api/users/${id}`);
        return await api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * PATCH /api/users/{id}/status
     * @param {string} id - User ID
     * @param {boolean} active - New status
     * @returns {Promise<Object>} Updated user
     */
    async updateStatus(id, active) {
        console.log(`[UsersApi] PATCH /api/users/${id}/status`, { active });
        return await api.put(`${this.baseUrl}/${id}/status`, { active });
    }
}

// Export singleton
const usersApi = new UsersApi();
