/**
 * Admin Attractions Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    const isEditMode = { active: false, id: null };

    // DOM Elements
    const tableBody = document.getElementById('tableBody');
    const searchInput = document.getElementById('searchInput');
    const modal = document.getElementById('modal');
    const form = document.getElementById('form');
    const toggleBtn = document.querySelector('.toggle-sidebar');
    const sidebar = document.querySelector('.sidebar');

    init();

    async function init() {
        setupEvents();
        await loadData();
    }

    async function loadData() {
        try {
            entities = await attractionsApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
        }
    }

    function setupEvents() {
        searchInput.addEventListener('input', renderTable);

        document.getElementById('addBtn').addEventListener('click', openAddModal);
        document.getElementById('closeModal').addEventListener('click', closeModal);
        document.getElementById('cancelBtn').addEventListener('click', closeModal);
        window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

        form.addEventListener('submit', handleSubmit);

        // Sidebar Toggle
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => sidebar.classList.toggle('active'));
        }
    }

    function renderTable() {
        const query = searchInput.value.toLowerCase();
        const filtered = entities.filter(e => e.name.toLowerCase().includes(query));

        tableBody.innerHTML = '';
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No attractions found.</td></tr>`;
            return;
        }

        filtered.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.category}</td>
                <td>${item.ticketPrice > 0 ? item.ticketPrice + ' DH' : 'Free'}</td>
                <td><small>${item.description || '-'}</small></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon btn-edit" onclick="editItem(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-icon btn-delete" onclick="deleteItem(${item.id})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function openAddModal() {
        isEditMode.active = false;
        document.getElementById('modalTitle').textContent = 'Add Attraction';
        form.reset();
        modal.classList.add('show');
    }

    window.editItem = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Attraction';
        const item = await attractionsApi.getById(id);

        document.getElementById('name').value = item.name;
        document.getElementById('category').value = item.category;
        document.getElementById('ticketPrice').value = item.ticketPrice;
        document.getElementById('description').value = item.description;

        modal.classList.add('show');
    }

    window.deleteItem = async (id) => {
        if (confirm('Delete this attraction?')) {
            await attractionsApi.delete(id);
            loadData();
        }
    }

    function closeModal() {
        modal.classList.remove('show');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            category: document.getElementById('category').value,
            ticketPrice: document.getElementById('ticketPrice').value,
            description: document.getElementById('description').value
        };

        if (isEditMode.active) {
            await attractionsApi.update(isEditMode.id, data);
        } else {
            await attractionsApi.create(data);
        }
        closeModal();
        loadData();
    }
});
