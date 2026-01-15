/**
 * User Management Logic
 * Handles CRUD operations with backend API and UI interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let users = [];
    let isEditMode = false;
    let currentUserId = null;
    let isLoading = false;

    // DOM Elements
    const els = {
        tableBody: document.getElementById('userTableBody'),
        searchInput: document.getElementById('searchInput'),
        roleFilter: document.getElementById('roleFilter'),
        statusFilter: document.getElementById('statusFilter'),
        modal: document.getElementById('userModal'),
        modalTitle: document.getElementById('modalTitle'),
        form: document.getElementById('userForm'),
        closeBtn: document.getElementById('closeModal'),
        cancelBtn: document.getElementById('cancelBtn'),
        addBtn: document.getElementById('addUserBtn'),
        activeToggle: document.getElementById('userActive'),
        loadingIndicator: document.getElementById('loadingIndicator')
    };

    // Form fields
    const formFields = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        username: document.getElementById('username'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        role: document.getElementById('userRole'),
        active: document.getElementById('userActive')
    };

    // --- Initialization ---
    init();

    async function init() {
        setupEventListeners();
        await loadUsers();
        renderTable();
    }

    // --- Data Management ---
    async function loadUsers() {
        try {
            showLoading(true);
            users = await usersApi.getAll();
            renderTable();
        } catch (error) {
            console.error('Failed to load users:', error);
            showError('Failed to load users. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    async function saveUser(userData) {
        try {
            showLoading(true);
            if (isEditMode && currentUserId) {
                // Update existing user
                const updatedUser = await usersApi.update(currentUserId, userData);
                const index = users.findIndex(u => u.id === currentUserId);
                if (index !== -1) {
                    users[index] = updatedUser;
                }
                showSuccess('User updated successfully');
            } else {
                // Create new user
                const newUser = await usersApi.create(userData);
                users.push(newUser);
                showSuccess('User created successfully');
            }
            renderTable();
            closeModal();
        } catch (error) {
            console.error('Error saving user:', error);
            showError(error.message || 'Failed to save user. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    async function deleteUser(id) {
        if (!confirm('Are you sure you want to delete this user?')) return;
        
        try {
            showLoading(true);
            await usersApi.delete(id);
            users = users.filter(user => user.id !== id);
            renderTable();
            showSuccess('User deleted successfully');
        } catch (error) {
            console.error('Error deleting user:', error);
            showError('Failed to delete user. Please try again.');
        } finally {
            showLoading(false);
        }
    }

    async function toggleUserStatus(id, active) {
        try {
            showLoading(true);
            await usersApi.updateStatus(id, active);
            const user = users.find(u => u.id === id);
            if (user) user.active = active;
            renderTable();
        } catch (error) {
            console.error('Error updating user status:', error);
            showError('Failed to update user status. Please try again.');
            // Revert the UI on error
            const user = users.find(u => u.id === id);
            if (user) user.active = !active; // Revert the status
            renderTable();
        } finally {
            showLoading(false);
        }
    }

    // --- UI Helpers ---
    function showLoading(show) {
        isLoading = show;
        if (els.loadingIndicator) {
            els.loadingIndicator.style.display = show ? 'block' : 'none';
        }
        // Disable form controls while loading
        const formControls = document.querySelectorAll('button, input, select');
        formControls.forEach(control => {
            if (control !== els.loadingIndicator) {
                control.disabled = show;
            }
        });
    }

    function showError(message) {
        // You can replace this with a more sophisticated notification system
        alert(`Error: ${message}`);
    }

    function showSuccess(message) {
        // You can replace this with a more sophisticated notification system
        alert(`Success: ${message}`);
    }

    // --- Form Handling ---
    function openModal(user = null) {
        isEditMode = !!user;
        currentUserId = user ? user.id : null;
        
        // Reset form
        els.form.reset();
        
        // Set title
        els.modalTitle.textContent = isEditMode ? 'Edit User' : 'Add New User';
        
        // Populate form if in edit mode
        if (isEditMode) {
            formFields.firstName.value = user.firstName || '';
            formFields.lastName.value = user.lastName || '';
            formFields.username.value = user.username || '';
            formFields.email.value = user.email || '';
            formFields.role.value = user.role || 'TOURIST';
            formFields.active.checked = user.active !== false; // Default to true if not set
            
            // Hide password fields for edit mode (unless implementing password change)
            document.getElementById('passwordGroup').style.display = 'none';
            document.getElementById('confirmPasswordGroup').style.display = 'none';
        } else {
            // Show password fields for new user
            document.getElementById('passwordGroup').style.display = 'block';
            document.getElementById('confirmPasswordGroup').style.display = 'block';
        }
        
        // Show modal
        els.modal.style.display = 'block';
    }

    function closeModal() {
        els.modal.style.display = 'none';
        currentUserId = null;
        isEditMode = false;
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Basic validation
        if (!isEditMode && (!formFields.password.value || formFields.password.value.length < 6)) {
            showError('Password must be at least 6 characters long');
            return;
        }
        
        if (!isEditMode && formFields.password.value !== formFields.confirmPassword.value) {
            showError('Passwords do not match');
            return;
        }
        
        // Prepare user data
        const userData = {
            firstName: formFields.firstName.value.trim(),
            lastName: formFields.lastName.value.trim(),
            username: formFields.username.value.trim(),
            email: formFields.email.value.trim(),
            role: formFields.role.value,
            active: formFields.active.checked
        };
        
        // Only include password if it's a new user or password is being changed
        if (!isEditMode || formFields.password.value) {
            userData.password = formFields.password.value;
        }
        
        // Save user
        saveUser(userData);
    }

    // --- Table Rendering ---
    function renderTable() {
        if (!els.tableBody) return;
        
        // Get filter values
        const searchTerm = els.searchInput ? els.searchInput.value.toLowerCase() : '';
        const roleFilter = els.roleFilter ? els.roleFilter.value : '';
        const statusFilter = els.statusFilter ? els.statusFilter.value : '';
        
        // Filter users
        const filteredUsers = users.filter(user => {
            const matchesSearch = 
                user.firstName.toLowerCase().includes(searchTerm) ||
                user.lastName.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.username.toLowerCase().includes(searchTerm);
                
            const matchesRole = !roleFilter || user.role === roleFilter;
            const matchesStatus = statusFilter === '' || 
                                (statusFilter === 'active' && user.active) ||
                                (statusFilter === 'inactive' && !user.active);
            
            return matchesSearch && matchesRole && matchesStatus;
        });
        
        // Clear table
        els.tableBody.innerHTML = '';
        
        if (filteredUsers.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" class="text-center">No users found</td>
            `;
            els.tableBody.appendChild(row);
            return;
        }
        
        // Add rows for each user
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.username}</td>
                <td><span class="badge ${getRoleBadgeClass(user.role)}">${user.role}</span></td>
                <td>
                    <label class="switch">
                        <input type="checkbox" ${user.active ? 'checked' : ''} 
                               onchange="toggleUserStatus('${user.id}', this.checked)">
                        <span class="slider round"></span>
                    </label>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td class="actions">
                    <button class="btn btn-sm btn-edit" onclick="openEditModal('${user.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteUser('${user.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            els.tableBody.appendChild(row);
        });
    }
    
    function getRoleBadgeClass(role) {
        switch(role) {
            case 'ADMIN': return 'badge-admin';
            case 'TOURIST': return 'badge-tourist';
            case 'STUDENT': return 'badge-student';
            case 'JOB_APPLICANT': return 'badge-job';
            case 'BUSINESS_USER': return 'badge-business';
            default: return 'badge-secondary';
        }
    }
    
    // --- Event Listeners ---
    function setupEventListeners() {
        // Modal close button
        if (els.closeBtn) {
            els.closeBtn.addEventListener('click', closeModal);
        }
        
        // Cancel button
        if (els.cancelBtn) {
            els.cancelBtn.addEventListener('click', closeModal);
        }
        
        // Add user button
        if (els.addBtn) {
            els.addBtn.addEventListener('click', () => openModal());
        }
        
        // Form submission
        if (els.form) {
            els.form.addEventListener('submit', handleFormSubmit);
        }
        
        // Search and filter inputs
        const filterInputs = [els.searchInput, els.roleFilter, els.statusFilter];
        filterInputs.forEach(input => {
            if (input) {
                input.addEventListener('input', () => renderTable());
                input.addEventListener('change', () => renderTable());
            }
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === els.modal) {
                closeModal();
            }
        });
    }
    
    // Expose functions to global scope for inline event handlers
    window.openEditModal = async (id) => {
        try {
            const user = await usersApi.getById(id);
            openModal(user);
        } catch (error) {
            console.error('Error loading user:', error);
            showError('Failed to load user data. Please try again.');
        }
    };
    
    window.deleteUser = (id) => {
        deleteUser(id);
    };
    
    window.toggleUserStatus = (id, active) => {
        toggleUserStatus(id, active);
    };
});
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    firstName: 'Jane',
                    lastName: 'Student',
                    username: 'student1',
                    email: 'student@example.com',
                    password: 'password123',
                    role: 'STUDENT',
                    active: true,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    firstName: 'Bob',
                    lastName: 'Job',
                    username: 'jobseeker',
                    email: 'job@example.com',
                    password: 'password123',
                    role: 'JOB_APPLICANT',
                    active: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: generateId(),
                    firstName: 'Alice',
                    lastName: 'Business',
                    username: 'bizowner',
                    email: 'biz@example.com',
                    password: 'password123',
                    role: 'BUSINESS_USER',
                    active: true,
                    createdAt: new Date().toISOString()
                }
            ];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialUsers));
        }
    }

    function loadUsers() {
        users = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function saveUsers() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        renderTable();
    }

    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // --- UI Rendering ---
    function renderTable() {
        const searchTerm = els.searchInput.value.toLowerCase();
        const roleFilter = els.roleFilter.value;
        const statusFilter = els.statusFilter.value;

        const filteredUsers = users.filter(user => {
            const matchesSearch =
                user.username.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);

            const matchesRole = roleFilter === 'all' || user.role === roleFilter;

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'active' ? user.active : !user.active);

            return matchesSearch && matchesRole && matchesStatus;
        });

        els.tableBody.innerHTML = '';

        if (filteredUsers.length === 0) {
            els.tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: #718096;">No users found.</td></tr>`;
            return;
        }

        filteredUsers.forEach(user => {
            const createdDate = new Date(user.createdAt).toLocaleDateString();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div style="display:flex; align-items:center;">
                        <div class="user-avatar" style="width: 32px; height: 32px; background: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 10px; color: #4a5568;">
                            ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                        </div>
                        ${user.firstName} ${user.lastName}
                    </div>
                </td>
                <td>@${user.username}</td>
                <td>${user.email}</td>
                <td><span class="badge role-${user.role.toLowerCase()}">${user.role}</span></td>
                <td>
                    <span class="badge ${user.active ? 'status-active' : 'status-inactive'}">
                        ${user.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${createdDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="openEditModal('${user.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" onclick="deleteUser('${user.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            els.tableBody.appendChild(row);
        });
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        els.searchInput.addEventListener('input', renderTable);
        els.roleFilter.addEventListener('change', renderTable);
        els.statusFilter.addEventListener('change', renderTable);

        els.addBtn.addEventListener('click', () => openModal());
        els.closeBtn.addEventListener('click', closeModal);
        els.cancelBtn.addEventListener('click', closeModal);
        els.modal.addEventListener('click', (e) => {
            if (e.target === els.modal) closeModal();
        });

        els.form.addEventListener('submit', handleFormSubmit);
    }

    // --- Form Handling ---
    function openModal() {
        isEditMode = false;
        els.modalTitle.textContent = 'Add New User';
        els.form.reset();
        document.getElementById('userId').value = '';
        els.activeToggle.checked = true;
        document.getElementById('password').required = true;
        els.modal.classList.add('show');
    }

    window.openEditModal = (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;

        isEditMode = true;
        els.modalTitle.textContent = 'Edit User';
        document.getElementById('userId').value = user.id;
        document.getElementById('firstName').value = user.firstName;
        document.getElementById('lastName').value = user.lastName;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('password').value = ''; // Don't show password
        document.getElementById('password').required = false; // Not required on edit

        els.activeToggle.checked = user.active;

        els.modal.classList.add('show');
    };

    function closeModal() {
        els.modal.classList.remove('show');
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            role: document.getElementById('role').value,
            active: els.activeToggle.checked,
            password: document.getElementById('password').value
        };

        if (isEditMode) {
            updateUser(document.getElementById('userId').value, formData);
        } else {
            createUser(formData);
        }

        closeModal();
    }

    // --- CRUD Operations ---
    function createUser(data) {
        if (users.some(u => u.username === data.username)) {
            alert('Username already exists!');
            return;
        }

        const newUser = {
            id: generateId(),
            ...data,
            createdAt: new Date().toISOString()
        };

        users.unshift(newUser);
        saveUsers();
    }

    function updateUser(id, data) {
        const index = users.findIndex(u => u.id === id);
        if (index === -1) return;

        // Validation for duplication (excluding self)
        if (users.some(u => u.username === data.username && u.id !== id)) {
            alert('Username already exists!');
            return;
        }

        const existingUser = users[index];
        users[index] = {
            ...existingUser,
            ...data,
            // Keep old password if new one is empty
            password: data.password || existingUser.password
        };
        saveUsers();
    }

    window.deleteUser = (id) => {
        if (confirm('Are you sure you want to delete this user?')) {
            users = users.filter(u => u.id !== id);
            saveUsers();
        }
    };
});
