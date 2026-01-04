// ========================================
// Configuration de l'API
// ========================================
const API_BASE_URL = 'http://localhost:8080';

const api = {
    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};

// ========================================
// Gestion des événements DOM
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // ========================================
    // Login Logic
    // ========================================
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                console.log('Logging in as:', username);

                const response = await api.post('/auth/login', { username, password });
                console.log('Login response:', response);

                const token = response.token;
                const role = response.role;
                const userName = response.username;

                if (!token || !role) {
                    throw new Error('Invalid response from server');
                }

                // Store credentials
                localStorage.setItem('token', token);
                localStorage.setItem('role', role);
                localStorage.setItem('username', userName);

                console.log('Login successful. Role:', role);

                // Redirect based on role
                let dashboardUrl = '../index.html';

                switch (role) {
                    case 'ADMIN':
                        dashboardUrl = '../dashboards/admin-dashboard.html';
                        break;
                    case 'TOURIST':
                        dashboardUrl = '../dashboards/tourism-dashboard.html';
                        break;
                    case 'STUDENT':
                        dashboardUrl = '../dashboards/student-dashboard.html';
                        break;
                    case 'JOB_APPLICANT':
                        dashboardUrl = '../dashboards/job-dashboard.html';
                        break;
                    case 'BUSINESS_USER':
                        dashboardUrl = '../dashboards/business-dashboard.html';
                        break;
                    default:
                        console.warn('Unknown role:', role);
                }

                console.log('Redirecting to:', dashboardUrl);
                window.location.href = dashboardUrl;

            } catch (error) {
                console.error('Login failed:', error);
                alert('Login failed: ' + error.message);
            }
        });
    }

    // ========================================
    // Register Logic
    // ========================================
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const firstName = document.getElementById('reg-firstname').value.trim();
            const lastName = document.getElementById('reg-lastname').value.trim();
            const username = document.getElementById('reg-username').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value;

            const roleSelect = document.getElementById('role');
            const role = roleSelect ? roleSelect.value : null;

            const payload = {
                firstName,
                lastName,
                username,
                email,
                password
            };

            if (role && role !== '') {
                payload.role = role;
            }

            try {
                console.log('Registering with payload:', payload);

                const response = await api.post('/auth/register', payload);
                console.log('Registration response:', response);

                if (response.token) {
                    alert(`Registration successful! You are registered as ${response.role}. Redirecting to login...`);
                } else {
                    alert('Registration successful! Please login.');
                }

                window.location.href = 'login.html';

            } catch (error) {
                console.error('Registration failed:', error);
                alert('Registration failed: ' + error.message);
            }
        });
    }

    // ========================================
    // Password Toggle Logic
    // ========================================
    setupPasswordToggle('password', 'togglePassword');
    setupPasswordToggle('reg-password', 'toggleRegPassword');
});

// ========================================
// Helper Functions
// ========================================
function setupPasswordToggle(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);

    if (input && toggle) {
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);

            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    }
}