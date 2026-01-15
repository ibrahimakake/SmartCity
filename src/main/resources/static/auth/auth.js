// ========================================
// API Configuration
// ========================================
const API_BASE_URL = 'http://localhost:8080';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
        this.isRefreshing = false;
        this.failedQueue = [];
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        // Add auth header if token exists
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        };

        try {
            const response = await fetch(url, config);

            // Handle 401 Unauthorized (Token expired/invalid)
            if (response.status === 401 && !endpoint.includes('/auth/')) {
                return this.handleUnauthorized({ endpoint, options });
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async handleUnauthorized(originalRequest) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            this.redirectToLogin();
            return Promise.reject(new Error('Session expired. Please log in again.'));
        }

        // If already refreshing, add request to queue
        if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
                this.failedQueue.push({ resolve, reject });
            }).then(() => {
                return this.request(originalRequest.endpoint, originalRequest.options);
            });
        }

        this.isRefreshing = true;

        try {
            const { accessToken, refreshToken: newRefreshToken } = await this.post('/auth/refresh-token', { refreshToken });

            // Update tokens in storage
            localStorage.setItem('token', accessToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Retry the original request
            const result = await this.request(originalRequest.endpoint, {
                ...originalRequest.options,
                headers: {
                    ...originalRequest.options.headers,
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            return result;
        } catch (error) {
            this.redirectToLogin();
            throw error;
        } finally {
            this.isRefreshing = false;
        }
    }

    redirectToLogin() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('username');

        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/auth/login.html';
        }
    }

    // HTTP Methods
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

const api = new ApiClient();

// ========================================
// Auth Functions
// ========================================
async function login(credentials) {
    const response = await api.post('/auth/login', credentials);

    if (response.token && response.refreshToken) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('role', response.role);
        localStorage.setItem('username', response.username);

        if (response.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }
    }

    return response;
}

async function logout() {
    try {
        await api.post('/auth/logout');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        window.location.href = '/auth/login.html';
    }
}

// ========================================
// DOM Event Handlers
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorElement = document.getElementById('error-message');

    // Password toggle functionality
    const setupPasswordToggle = (inputId, toggleId) => {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);

        if (input && toggle) {
            toggle.addEventListener('click', () => {
                const type = input.type === 'password' ? 'text' : 'password';
                input.type = type;
                const icon = toggle.querySelector('i') || toggle;
                icon.classList.toggle('fa-eye');
                icon.classList.toggle('fa-eye-slash');
            });
        }
    };

    // Login form
    if (loginForm) {
        const loginButton = loginForm.querySelector('button[type="submit"]');

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (loginButton) {
                loginButton.disabled = true;
                loginButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Logging in...';
            }

            try {
                const response = await login({ username, password });

                // Redirect based on role
                const dashboardUrl = getDashboardUrl(response.role);
                window.location.href = dashboardUrl;

            } catch (error) {
                console.error('Login failed:', error);
                if (errorElement) {
                    errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
                    errorElement.style.display = 'block';
                } else {
                    alert(error.message || 'Login failed. Please check your credentials.');
                }
            } finally {
                if (loginButton) {
                    loginButton.disabled = false;
                    loginButton.textContent = 'Login';
                }
            }
        });

        // Setup password toggle if elements exist
        setupPasswordToggle('password', 'togglePassword');
    }

    // Register form
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                firstName: document.getElementById('reg-firstname')?.value.trim(),
                lastName: document.getElementById('reg-lastname')?.value.trim(),
                username: document.getElementById('reg-username')?.value.trim(),
                email: document.getElementById('reg-email')?.value.trim(),
                password: document.getElementById('reg-password')?.value,
                role: document.getElementById('role')?.value
            };

            const submitButton = registerForm.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span> Registering...';
            }

            try {
                const response = await api.post('/auth/register', formData);

                if (response.token) {
                    // Auto-login after successful registration
                    await login({
                        username: formData.username,
                        password: formData.password
                    });

                    // Redirect based on role
                    const dashboardUrl = getDashboardUrl(response.role);
                    window.location.href = dashboardUrl;
                } else {
                    alert('Registration successful! Please log in.');
                    window.location.href = 'login.html';
                }
            } catch (error) {
                console.error('Registration failed:', error);
                if (errorElement) {
                    errorElement.textContent = error.message || 'Registration failed. Please try again.';
                    errorElement.style.display = 'block';
                } else {
                    alert(error.message || 'Registration failed. Please try again.');
                }
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Register';
                }
            }
        });

        // Setup password toggle if elements exist
        setupPasswordToggle('reg-password', 'toggleRegPassword');
    }
});

function getDashboardUrl(role) {
    switch (role) {
        case 'ADMIN':
            return '/dashboards/admin-dashboard.html';
        case 'STUDENT':
            return '/dashboards/student-dashboard.html';
        case 'TOURIST':
            return '/dashboards/tourism-dashboard.html';
        case 'BUSINESS_USER':
            return '/dashboards/business-dashboard.html';
        case 'JOB_APPLICANT':
            return '/dashboards/job-dashboard.html';
        default:
            return '/index.html';
    }
}

// Auto-logout on 401 errors
window.addEventListener('storage', (e) => {
    if (e.key === 'token' && !e.newValue) {
        window.location.href = '/auth/login.html';
    }
});