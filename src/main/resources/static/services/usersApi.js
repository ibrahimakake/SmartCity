/**
 * Users API Service (Classic script)
 * Handles all backend interactions for User management.
 *
 * Requires: window.api (from /shared/api.js)
 * Exposes: window.usersApi
 */
(function () {
  'use strict';

  if (!window.api) {
    console.error('[UsersApi] window.api is not defined. Load /shared/api.js before usersApi.js');
  }

  const baseUrl = '/api/users';

  const usersApi = {
    async getAll() {
      console.log('[UsersApi] GET /api/users');
      return window.api.get(baseUrl);
    },

    async getById(id) {
      console.log(`[UsersApi] GET /api/users/${id}`);
      return window.api.get(`${baseUrl}/${encodeURIComponent(id)}`);
    },

    async getByEmail(email) {
      console.log(`[UsersApi] GET /api/users/email/${email}`);
      return window.api.get(`${baseUrl}/email/${encodeURIComponent(email)}`);
    },

    // ✅ ADD THIS: your fix request
    async getByUsername(username) {
      console.log(`[UsersApi] GET /api/users/username/${username}`);
      return window.api.get(`${baseUrl}/username/${encodeURIComponent(username)}`);
    },

    // ✅ Optional (best practice): if you add backend /api/users/me
    async getMe() {
      console.log('[UsersApi] GET /api/users/me');
      return window.api.get(`${baseUrl}/me`);
    },

    async create(user) {
      console.log('[UsersApi] POST /api/users', user);
      return window.api.post(baseUrl, user);
    },

    async update(id, user) {
      console.log(`[UsersApi] PUT /api/users/${id}`, user);
      return window.api.put(`${baseUrl}/${encodeURIComponent(id)}`, user);
    },

    async delete(id) {
      console.log(`[UsersApi] DELETE /api/users/${id}`);
      return window.api.delete(`${baseUrl}/${encodeURIComponent(id)}`);
    },

    async updateStatus(id, active) {
      console.log(`[UsersApi] PUT /api/users/${id}/status`, { active });
      return window.api.put(`${baseUrl}/${encodeURIComponent(id)}/status`, { active });
    }
  };

  window.usersApi = usersApi;
})();
