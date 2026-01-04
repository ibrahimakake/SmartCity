/**
 * Admin Hotels Page Logic
 * Handles Data Table rendering, CRUD operations, and Modal interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // State
    let hotels = [];
    let currentPage = 1;
    const itemsPerPage = 5;
    let currentFilter = 'all';
    let searchQuery = '';
    const isEditMode = { active: false, id: null };

    // DOM Elements
    const tableBody = document.getElementById('hotelsTableBody');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');

    // Modal Elements
    const modal = document.getElementById('hotelModal');
    const modalTitle = document.getElementById('modalTitle');
    const hotelForm = document.getElementById('hotelForm');
    const addBtn = document.getElementById('addHotelBtn');
    const closeBtn = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const imageInput = document.getElementById('hotelImage');
    const imagePreview = document.getElementById('imagePreview');

    // --- Initialization ---
    init();

    async function init() {
        await loadHotels();
        setupEventListeners();
    }

    async function loadHotels() {
        try {
            renderLoading();
            hotels = await hotelsApi.getAll();
            renderTable();
        } catch (error) {
            console.error('Failed to load hotels', error);
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    function setupEventListeners() {
        // Search & Filter
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value.toLowerCase();
            currentPage = 1;
            renderTable();
        });

        statusFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            currentPage = 1;
            renderTable();
        });

        // Pagination
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderTable();
            }
        });

        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(getFilteredHotels().length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderTable();
            }
        });

        // Modal Controls
        addBtn.addEventListener('click', openAddModal);
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        window.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        // Form Submission
        hotelForm.addEventListener('submit', handleFormSubmit);

        // Image Preview
        imageInput.addEventListener('change', handleImagePreview);

        // Sidebar Toggle
        const toggleBtn = document.querySelector('.toggle-sidebar');
        const sidebar = document.querySelector('.sidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });

            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', (e) => {
                if (window.innerWidth <= 992 &&
                    !sidebar.contains(e.target) &&
                    !toggleBtn.contains(e.target) &&
                    sidebar.classList.contains('active')) {
                    sidebar.classList.remove('active');
                }
            });
        }
    }

    // --- Rendering ---

    function getFilteredHotels() {
        return hotels.filter(hotel => {
            const matchesSearch = hotel.name.toLowerCase().includes(searchQuery) ||
                hotel.address.toLowerCase().includes(searchQuery);
            const matchesFilter = currentFilter === 'all'
                || (currentFilter === 'active' && hotel.active)
                || (currentFilter === 'inactive' && !hotel.active);
            return matchesSearch && matchesFilter;
        });
    }

    function renderTable() {
        const filtered = getFilteredHotels();
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const pageData = filtered.slice(start, end);
        const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

        tableBody.innerHTML = '';

        if (pageData.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="9" class="text-center">No hotels found.</td></tr>`;
            updatePagination(0, 0);
            return;
        }

        pageData.forEach(hotel => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${hotel.imageUrl || 'https://via.placeholder.com/50'}" class="hotel-thumb" alt="Thumb"></td>
                <td><strong>${hotel.name}</strong></td>
                <td>${hotel.address}</td>
                <td>
                    <small>Email: ${hotel.email || 'N/A'}</small><br>
                    <small>Tel: ${hotel.phone || 'N/A'}</small>
                </td>
                <td>${'⭐'.repeat(hotel.starRating)}</td>
                <td>${hotel.rating}</td>
                <td>${hotel.startingPrice ? 'DH ' + hotel.startingPrice : '-'}</td>
                <td>
                    <span class="status-badge ${hotel.active ? 'status-active' : 'status-inactive'}">
                        ${hotel.active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" title="Edit" onclick="editHotel(${hotel.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon btn-delete" title="Delete" onclick="deleteHotel(${hotel.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        updatePagination(currentPage, totalPages);
    }

    function renderLoading() {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Loading hotels...</td></tr>`;
    }

    function updatePagination(current, total) {
        pageInfo.textContent = `Page ${current} of ${total}`;
        prevBtn.disabled = current <= 1;
        nextBtn.disabled = current >= total;
    }

    // --- Modal & Form Handling ---

    function openAddModal() {
        isEditMode.active = false;
        isEditMode.id = null;
        modalTitle.textContent = 'Add New Hotel';
        hotelForm.reset();
        imageInput.value = '';
        imagePreview.src = 'https://via.placeholder.com/150?text=Preview'; // Reset preview
        clearErrors();
        modal.classList.add('show');
    }

    window.editHotel = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        modalTitle.textContent = 'Edit Hotel';
        clearErrors();

        try {
            const hotel = await hotelsApi.getById(id);
            if (!hotel) return;

            // Populate Form
            document.getElementById('name').value = hotel.name;
            document.getElementById('address').value = hotel.address;
            document.getElementById('email').value = hotel.email || '';
            document.getElementById('phone').value = hotel.phone || '';
            document.getElementById('starRating').value = hotel.starRating;
            document.getElementById('rating').value = hotel.rating;
            document.getElementById('startingPrice').value = hotel.startingPrice || '';
            document.getElementById('description').value = hotel.description || '';
            document.getElementById('active').checked = hotel.active;
            document.getElementById('hotelImage').value = hotel.imageUrl || '';
            imagePreview.src = hotel.imageUrl || 'https://via.placeholder.com/150?text=No+Image';

            modal.classList.add('show');
        } catch (err) {
            console.error(err);
            alert('Error fetching hotel details.');
        }
    };

    function closeModal() {
        modal.classList.remove('show');
    }

    async function handleFormSubmit(e) {
        e.preventDefault();

        if (!validateForm()) return;

        const formData = {
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            starRating: document.getElementById('starRating').value,
            rating: document.getElementById('rating').value,
            startingPrice: document.getElementById('startingPrice').value,
            description: document.getElementById('description').value,
            description: document.getElementById('description').value,
            active: document.getElementById('active').checked,
            imageUrl: document.getElementById('hotelImage').value
        };

        // Removed file upload logic as backend expects string URL

        try {
            if (isEditMode.active) {
                await hotelsApi.update(isEditMode.id, formData);
            } else {
                await hotelsApi.create(formData);
            }
            closeModal();
            loadHotels(); // Refresh table
        } catch (error) {
            console.error('Save failed', error);
            alert('Failed to save hotel.');
        }
    }

    function validateForm() {
        let isValid = true;
        clearErrors();

        const name = document.getElementById('name');
        const star = document.getElementById('starRating');
        const rating = document.getElementById('rating');
        const address = document.getElementById('address');

        if (!name.value.trim()) {
            showError('name', 'Name is required');
            isValid = false;
        }

        if (!address.value.trim()) {
            showError('address', 'Address is required');
            isValid = false;
        }

        if (star.value < 1 || star.value > 5) {
            showError('starRating', '1-5 Stars required');
            isValid = false;
        }

        if (rating.value < 0 || rating.value > 5) {
            showError('rating', '0-5 Rating required');
            isValid = false;
        }

        return isValid;
    }

    function showError(fieldId, msg) {
        document.getElementById(`error-${fieldId}`).textContent = msg;
    }

    function clearErrors() {
        document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    function handleImagePreview(e) {
        const url = e.target.value;
        if (url) {
            imagePreview.src = url;
            imagePreview.onerror = () => {
                imagePreview.src = 'https://via.placeholder.com/150?text=Invalid+URL';
            }
        } else {
            imagePreview.src = 'https://via.placeholder.com/150?text=Preview';
        }
    }

    window.deleteHotel = async (id) => {
        if (confirm('Are you sure you want to delete this hotel?')) {
            try {
                await hotelsApi.delete(id);
                loadHotels();
            } catch (error) {
                console.error(error);
                alert('Deletion failed.');
            }
        }
    };
});
