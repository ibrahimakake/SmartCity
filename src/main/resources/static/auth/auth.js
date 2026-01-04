/**
 * Smart City Auth Logic (REAL BACKEND)
 * - Calls Spring Boot /auth/login and /auth/register
 * - Saves JWT to localStorage
 * - Redirects after login/register
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = "http://localhost:8080"; // change later when deployed

  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // -------------------------
  // Helpers
  // -------------------------
  function setLoading(btn, text) {
    btn.dataset.originalText = btn.innerText;
    btn.innerText = text;
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  function resetLoading(btn) {
    btn.innerText = btn.dataset.originalText || btn.innerText;
    btn.disabled = false;
    btn.style.opacity = '1';
  }

  function saveToken(token) {
    localStorage.setItem("token", token);
  }

  // optional: decode role from JWT if backend doesn’t return it
  function decodeJwt(token) {
    try {
      const payload = token.split(".")[1];
      const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return null;
    }
  }

  function redirectByRole(role) {
    // Adjust to your routes/pages later
    switch (role) {
      case "ADMIN":
        window.location.href = "/admin/dashboard.html";
        break;
      case "TOURIST":
        window.location.href = "/tourism/index.html";
        break;
      case "STUDENT":
        window.location.href = "/student/index.html";
        break;
      case "JOB_APPLICANT":
        window.location.href = "/job/index.html";
        break;
      case "BUSINESS_USER":
        window.location.href = "/business/index.html";
        break;
      default:
        window.location.href = "/index.html";
    }
  }

  async function safeReadJson(res) {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); } catch { return null; }
  }

  // -------------------------
  // LOGIN
  // -------------------------
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      const formData = new FormData(loginForm);
      const data = Object.fromEntries(formData.entries());

      // expected fields: username, password
      if (!data.username || !data.password) {
        alert("Please fill username and password.");
        return;
      }

      try {
        setLoading(submitBtn, "Authenticating...");

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: data.username,
            password: data.password
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Login failed");
        }

        const body = await safeReadJson(res);

        // If your backend returns token in json: { token: "..." }
        const token = body?.token || body?.accessToken; // support alt naming
        if (!token) {
          // Some backends may return token as plain string (rare)
          // If so, remove safeReadJson and use res.text() directly.
          throw new Error("No token returned by backend.");
        }

        saveToken(token);

        // role may come from backend OR from JWT claims
        const role = body?.role || decodeJwt(token)?.role;
        alert(`Welcome back, ${data.username}! Login successful.`);
        redirectByRole(role);

      } catch (error) {
        console.error('Login error:', error);
        alert(error.message || 'Login failed. Please check your credentials.');
      } finally {
        resetLoading(submitBtn);
      }
    });
  }

  // -------------------------
  // REGISTER
  // -------------------------
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = registerForm.querySelector('button[type="submit"]');

      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());

      // Basic validation
      if (!data.password || data.password.length < 8) {
        alert('Password must be at least 8 characters long.');
        return;
      }

      try {
        setLoading(submitBtn, "Creating Profile...");

        // expected fields (adapt if your register form differs):
        // firstName, lastName, username, email, password, role
        const res = await fetch(`${API_BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || "Registration failed");
        }

        const body = await safeReadJson(res);

        // If backend auto-login returns token
        const token = body?.token || body?.accessToken;

        alert(`Account created successfully for ${data.username}!`);

        if (token) {
          saveToken(token);
          const role = body?.role || decodeJwt(token)?.role;
          redirectByRole(role);
        } else {
          // Normal behavior: go to login page
          window.location.href = 'login.html';
        }

      } catch (error) {
        console.error('Registration error:', error);
        alert(error.message || 'Registration failed. Please try again.');
      } finally {
        resetLoading(submitBtn);
      }
    });
  }

  // -------------------------
  // Input focus effects (kept)
  // -------------------------
  const inputs = document.querySelectorAll('.form-control');
  inputs.forEach(input => {
    input.addEventListener('focus', () => {
      input.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      if (!input.value) {
        input.parentElement.classList.remove('focused');
      }
    });
  });
});
