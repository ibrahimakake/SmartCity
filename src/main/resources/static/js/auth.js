import { saveToken, saveUser, clearAuth, isAuthenticated, getUser } from './storage.js';
import { authApi } from './api.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout-btn');
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const usernameSpan = document.getElementById('username');

// Check authentication state on page load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // Add logout event listener if logout button exists
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Add login form submit handler if login form exists
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Add register form submit handler if register form exists
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        setupPasswordValidation();
    }
});

/**
 * Update UI based on authentication state
 */
function updateAuthUI() {
    const isLoggedIn = isAuthenticated();
    
    if (authButtons) {
        authButtons.style.display = isLoggedIn ? 'none' : 'flex';
    }
    
    if (userMenu) {
        userMenu.style.display = isLoggedIn ? 'flex' : 'none';
        
        if (isLoggedIn) {
            const user = getUser();
            if (usernameSpan && user) {
                usernameSpan.textContent = user.name || user.email;
            }
        }
    }
    
    // Redirect to login if trying to access protected pages while not authenticated
    const isAuthPage = window.location.pathname.includes('login.html') || 
                      window.location.pathname.includes('register.html');
    
    if (!isLoggedIn && !isAuthPage && isProtectedPage()) {
        window.location.href = '/login.html';
    }
    
    if (isLoggedIn && isAuthPage) {
        window.location.href = '/';
    }
}

/**
 * Check if current page requires authentication
 */
function isProtectedPage() {
    const protectedPaths = ['/pages/admin.html', '/pages/profile.html'];
    return protectedPaths.some(path => window.location.pathname.endsWith(path));
}

/**
 * Handle login form submission
 * @param {Event} e - Form submit event
 */
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('error-message');
    
    try {
        const data = await authApi.login({ email, password });
        
        // Save token and user data
        saveToken(data.token);
        saveUser(data.user);
        
        // Redirect based on user role
        redirectAfterLogin(data.user.role);
        
    } catch (error) {
        console.error('Login failed:', error);
        if (errorElement) {
            errorElement.textContent = error.message || 'Login failed. Please check your credentials.';
        }
    }
}

/**
 * Handle registration form submission
 * @param {Event} e - Form submit event
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const userData = {
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        role: formData.get('role')
    };
    
    const errorElement = document.getElementById('error-message');
    
    try {
        // Validate password confirmation
        if (userData.password !== formData.get('confirmPassword')) {
            throw new Error('Passwords do not match');
        }
        
        const data = await authApi.register(userData);
        
        // Show success message
        if (errorElement) {
            errorElement.textContent = '';
            const successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.textContent = 'Registration successful! Redirecting to login...';
            registerForm.appendChild(successDiv);
            
            // Clear form
            registerForm.reset();
            
            // Redirect to login after a short delay
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
        }
        
    } catch (error) {
        console.error('Registration failed:', error);
        if (errorElement) {
            errorElement.textContent = error.message || 'Registration failed. Please try again.';
        }
    }
}

/**
 * Handle user logout
 */
function handleLogout() {
    clearAuth();
    window.location.href = '/';
}

/**
 * Redirect user after successful login based on their role
 * @param {string} role - User role
 */
function redirectAfterLogin(role) {
    let redirectPath = '/';
    
    switch (role) {
        case 'ADMIN':
            redirectPath = '/pages/admin.html';
            break;
        case 'TOURIST':
            redirectPath = '/pages/tourism.html';
            break;
        case 'STUDENT':
            redirectPath = '/pages/student.html';
            break;
        case 'JOB_APPLICANT':
            redirectPath = '/pages/job.html';
            break;
        case 'BUSINESS_USER':
            redirectPath = '/pages/business.html';
            break;
    }
    
    window.location.href = redirectPath;
}

/**
 * Set up password validation for the registration form
 */
function setupPasswordValidation() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrength = document.getElementById('password-strength');
    
    if (!passwordInput || !confirmPasswordInput) return;
    
    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = calculatePasswordStrength(password);
            updatePasswordStrengthIndicator(strength);
        });
    }
    
    // Password confirmation check
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (password && confirmPassword && password !== confirmPassword) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }
}

/**
 * Calculate password strength
 * @param {string} password - Password to check
 * @returns {number} Strength score (0-100)
 */
function calculatePasswordStrength(password) {
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 25;
    
    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 10;
    
    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 10;
    
    // Contains numbers
    if (/[0-9]/.test(password)) strength += 10;
    
    // Contains special characters
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    
    // Length bonus
    if (password.length >= 12) strength += 25;
    
    return Math.min(100, strength);
}

/**
 * Update the password strength indicator
 * @param {number} strength - Password strength score (0-100)
 */
function updatePasswordStrengthIndicator(strength) {
    const strengthBar = document.querySelector('.strength-bar');
    if (!strengthBar) return;
    
    let color = '#dc3545'; // Red
    
    if (strength >= 70) {
        color = '#28a745'; // Green
    } else if (strength >= 40) {
        color = '#ffc107'; // Yellow
    }
    
    strengthBar.style.width = `${strength}%`;
    strengthBar.style.backgroundColor = color;
}

// Export functions that might be needed in other files
window.auth = {
    isAuthenticated,
    getUser,
    logout: handleLogout,
    updateUI: updateAuthUI
};

// Initialize auth UI when script loads
updateAuthUI();
