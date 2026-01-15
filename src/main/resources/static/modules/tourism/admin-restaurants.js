/**
 * Admin Restaurants Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    const isEditMode = { active: false, id: null };
    const elements = {
        tableBody: document.getElementById('tableBody'),
        searchInput: document.getElementById('searchInput'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
        imageInput: document.getElementById('imageUrl'),
        imagePreview: document.getElementById('imagePreview'),
        toggleBtn: document.querySelector('.toggle-sidebar'),
        sidebar: document.querySelector('.sidebar')
    };

    init();

    async function init() {
        setupEvents();
        await loadData();
    }

    async function loadData() {
        try {
            entities = await restaurantsApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
            elements.tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    function setupEvents() {
        elements.searchInput.addEventListener('input', renderTable);
        document.getElementById('addBtn').addEventListener('click', openAddModal);
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('cancelBtn').addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });

        elements.form.addEventListener('submit', handleSubmit);
        elements.imageInput.addEventListener('input', handleImagePreview);

        if (elements.toggleBtn) elements.toggleBtn.addEventListener('click', () => elements.sidebar.classList.toggle('active'));
    }

    function renderTable() {
        const query = elements.searchInput.value.toLowerCase();
        const filtered = entities.filter(e =>
            e.name.toLowerCase().includes(query) ||
            (e.cuisineType && e.cuisineType.toLowerCase().includes(query))
        );

        elements.tableBody.innerHTML = '';
        if (filtered.length === 0) {
            elements.tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No restaurants found.</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${item.imageUrl || 'https://via.placeholder.com/50'}" class="hotel-thumb"></td>
                <td><strong>${item.name}</strong></td>
                <td>${item.cuisineType || '-'}</td>
                <td>${item.priceRange || '-'}</td>
                <td>${item.rating} (${item.starRating}★)</td>
                <td><small>${item.contactNumber || '-'}</small></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editItem(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            elements.tableBody.appendChild(tr);
        });
    }

    function openAddModal() {
        isEditMode.active = false;
        document.getElementById('modalTitle').textContent = 'Add Restaurant';
        elements.form.reset();
        elements.imageInput.value = '';
        elements.imagePreview.src = 'https://via.placeholder.com/150?text=Preview';
        elements.modal.classList.add('show');
    }

    window.editItem = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Restaurant';

        try {
            const item = await restaurantsApi.getById(id);
            document.getElementById('name').value = item.name;
            document.getElementById('cuisineType').value = item.cuisineType;
            document.getElementById('address').value = item.address;
            document.getElementById('priceRange').value = item.priceRange;
            document.getElementById('contactNumber').value = item.contactNumber;
            document.getElementById('starRating').value = item.starRating;
            document.getElementById('rating').value = item.rating;
            document.getElementById('description').value = item.description;
            elements.imageInput.value = item.imageUrl || '';
            elements.imagePreview.src = item.imageUrl || 'https://via.placeholder.com/150?text=No+Image';

            elements.modal.classList.add('show');
        } catch (e) {
            console.error(e);
            alert('Error fetching details');
        }
    }

    window.deleteItem = async (id) => {
        if (confirm('Delete this restaurant?')) {
            try {
                await restaurantsApi.delete(id);
                loadData();
            } catch (e) {
                console.error(e);
                alert('Deletion failed');
            }
        }
    }

    function closeModal() {
        elements.modal.classList.remove('show');
    }

    function handleImagePreview(e) {
        const url = e.target.value;
        if (url) {
            elements.imagePreview.src = url;
            elements.imagePreview.onerror = () => elements.imagePreview.src = 'https://via.placeholder.com/150?text=Invalid+URL';
        } else {
            elements.imagePreview.src = 'https://via.placeholder.com/150?text=Preview';
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            cuisineType: document.getElementById('cuisineType').value,
            address: document.getElementById('address').value,
            priceRange: document.getElementById('priceRange').value,
            contactNumber: document.getElementById('contactNumber').value,
            starRating: document.getElementById('starRating').value,
            rating: document.getElementById('rating').value,
            description: document.getElementById('description').value,
            imageUrl: elements.imageInput.value
        };

        try {
            if (isEditMode.active) {
                await restaurantsApi.update(isEditMode.id, data);
            } else {
                await restaurantsApi.create(data);
            }
            closeModal();
            loadData();
        } catch (e) {
            console.error(e);
            alert('Operation failed');
        }
    }
});
