/**
 * Admin Colleges Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
        imgIn: document.getElementById('imageUrl'),
        imgPre: document.getElementById('imagePreview'),
        tog: document.querySelector('.toggle-sidebar'),
        side: document.querySelector('.sidebar')
    };

    init();

    async function init() {
        setupEvents();
        await loadData();
    }

    async function loadData() {
        try {
            entities = await collegesApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
            els.table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    function setupEvents() {
        els.search.addEventListener('input', renderTable);
        document.getElementById('addBtn').addEventListener('click', openAdd);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('cancelBtn').addEventListener('click', close);
        window.addEventListener('click', (e) => { if (e.target === els.modal) close(); });
        els.form.addEventListener('submit', save);
        els.imgIn.addEventListener('input', preview);
        if (els.tog) els.tog.addEventListener('click', () => els.side.classList.toggle('active'));
    }

    function renderTable() {
        const q = els.search.value.toLowerCase();
        const res = entities.filter(e => e.name.toLowerCase().includes(q));
        els.table.innerHTML = '';
        if (res.length === 0) {
            els.table.innerHTML = `<tr><td colspan="7" class="text-center">No colleges found.</td></tr>`;
            return;
        }

        res.forEach(item => {
            els.table.innerHTML += `
                <tr>
                    <td><img src="${item.imageUrl || 'https://via.placeholder.com/50'}" class="hotel-thumb"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.address}</td>
                    <td>${item.contact || '-'}</td>
                    <td>${item.openTime || '-'} - ${item.closeTime || '-'}</td>
                    <td><span class="status-badge ${item.active ? 'status-active' : 'status-inactive'}">${item.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="edit(${item.id})"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="del(${item.id})"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
    }

    function openAdd() {
        isEditMode.active = false;
        document.getElementById('modalTitle').textContent = 'Add College';
        els.form.reset();
        els.imgPre.src = 'https://via.placeholder.com/150?text=Preview';
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit College';
        try {
            const d = await collegesApi.getById(id);

            document.getElementById('name').value = d.name;
            document.getElementById('address').value = d.address;
            document.getElementById('contact').value = d.contact;
            document.getElementById('openTime').value = d.openTime;
            document.getElementById('closeTime').value = d.closeTime;
            document.getElementById('description').value = d.description;
            document.getElementById('active').checked = d.active;

            els.imgIn.value = d.imageUrl || '';
            els.imgPre.src = d.imageUrl || 'https://via.placeholder.com/150?text=No+Image';
            els.modal.classList.add('show');
        } catch (e) {
            console.error(e);
            alert('Error loading details');
        }
    }

    window.del = async (id) => {
        if (confirm('Delete college?')) {
            try {
                await collegesApi.delete(id);
                loadData();
            } catch (e) {
                console.error(e);
                alert('Deletion failed');
            }
        }
    }

    function preview(e) {
        const url = e.target.value;
        if (url) {
            els.imgPre.src = url;
            els.imgPre.onerror = () => els.imgPre.src = 'https://via.placeholder.com/150?text=Invalid+URL';
        } else {
            els.imgPre.src = 'https://via.placeholder.com/150?text=Preview';
        }
    }

    async function save(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            contact: document.getElementById('contact').value,
            openTime: document.getElementById('openTime').value,
            closeTime: document.getElementById('closeTime').value,
            description: document.getElementById('description').value,
            active: document.getElementById('active').checked,
            imageUrl: els.imgIn.value
        };

        try {
            if (isEditMode.active) await collegesApi.update(isEditMode.id, data);
            else await collegesApi.create(data);
            close();
            loadData();
        } catch (e) {
            console.error(e);
            alert('Operation failed');
        }
    }
});
