class Api {
    constructor() {
        this.baseUrl = 'http://localhost:8080';
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    getHeaders() {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json'
        };
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    async handleUnauthorized(originalRequest) {
        const refreshToken = localStorage.getItem('refreshToken');

        // If no refresh token or already refreshing, redirect to login
        if (!refreshToken) {
            this.redirectToLogin();
            return Promise.reject(new Error('No refresh token available'));
        }

        // If already refreshing, add request to queue
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            }).then(() => {
                return this.request(originalRequest);
            });
        }

        this.isRefreshing = true;

        try {
            // Try to refresh the token
            const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });

            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }

            const { accessToken, refreshToken: newRefreshToken } = await response.json();

            // Update tokens in storage
            localStorage.setItem('token', accessToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Process queued requests
            this.processQueue(null, accessToken);

            // Retry the original request
            return this.request(originalRequest);
        } catch (error) {
            // If refresh fails, clear auth and redirect to login
            this.processQueue(error);
            this.redirectToLogin();
            return Promise.reject(error);
        } finally {
            this.isRefreshing = false;
        }
    }

    processQueue(error, token = null) {
        this.failedQueue.forEach(prom => {
            if (error) {
                prom.reject(error);
            } else {
                prom.resolve(token);
            }
        });
        this.failedQueue = [];
    }

    redirectToLogin() {
        // Clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        // Redirect to login page if not already there
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/auth/login.html';
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this.getHeaders();

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized (Token expired/invalid)
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                return this.handleUnauthorized({ endpoint, options });
            }

            // Parse JSON if possible
            let data;
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                throw new Error(data.message || data || `Error ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    }

    async authRequest(endpoint, body) {
        try {
            const response = await this.request(endpoint, {
                method: 'POST',
                body
            });
            return response;
        } catch (error) {
            console.error('Auth request failed:', error);
            throw error;
        }
    }

    // Auth methods
    async login(credentials) {
        const response = await this.authRequest('/auth/login', credentials);
        if (response.token && response.refreshToken) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('refreshToken', response.refreshToken);
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }
        return response;
    }

    async logout() {
        try {
            // Try to invalidate the token on the server
            await this.request('/auth/logout', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with client-side cleanup even if server logout fails
        } finally {
            // Clear auth data
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            // Redirect to login page
            window.location.href = '/auth/login.html';
        }
    }

    // Standard HTTP methods
    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body
        });
    }

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body
        });
    }

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}

// Make api globally available instead of using export
const api = new Api();
// If you need it available globally
window.api = api;