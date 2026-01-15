/**
 * Admin Businesses Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        sectorFilter: document.getElementById('sectorFilter'),
        statusFilter: document.getElementById('statusFilter'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
    };

    init();

    async function init() {
        setupEvents();
        await loadData();
    }

    async function loadData() {
        try {
            entities = await businessesApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
            els.table.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    function setupEvents() {
        els.search.addEventListener('input', renderTable);
        els.sectorFilter.addEventListener('change', renderTable);
        els.statusFilter.addEventListener('change', renderTable);
        document.getElementById('addBtn').addEventListener('click', openAdd);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('cancelBtn').addEventListener('click', close);
        window.addEventListener('click', (e) => { if (e.target === els.modal) close(); });
        els.form.addEventListener('submit', save);
    }

    function renderTable() {
        const q = els.search.value.toLowerCase();
        const sector = els.sectorFilter.value;
        const status = els.statusFilter.value;

        const res = entities.filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q);
            const matchesSector = sector === 'all' || e.sector === sector;
            const matchesStatus = status === 'all' || (status === 'active' ? e.active : !e.active);
            return matchesSearch && matchesSector && matchesStatus;
        });

        els.table.innerHTML = '';
        if (res.length === 0) {
            els.table.innerHTML = `<tr><td colspan="6" class="text-center">No businesses found.</td></tr>`;
            return;
        }

        res.forEach(item => {
            els.table.innerHTML += `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.sector}</td>
                    <td>${item.address}</td>
                    <td>${item.contact}<br><small>${item.phoneNumber || ''}</small></td>
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
        document.getElementById('modalTitle').textContent = 'Add Business';
        els.form.reset();
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Business';
        const d = await businessesApi.getById(id);

        document.getElementById('name').value = d.name;
        document.getElementById('sector').value = d.sector;
        document.getElementById('contact').value = d.contact;
        document.getElementById('address').value = d.address;
        document.getElementById('email').value = d.email || '';
        document.getElementById('phoneNumber').value = d.phoneNumber || '';
        document.getElementById('website').value = d.website || '';
        document.getElementById('description').value = d.description || '';
        document.getElementById('active').checked = d.active;

        els.modal.classList.add('show');
    }

    window.del = async (id) => {
        if (confirm('Delete business?')) { await businessesApi.delete(id); loadData(); }
    }

    async function save(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            sector: document.getElementById('sector').value,
            contact: document.getElementById('contact').value,
            address: document.getElementById('address').value,
            email: document.getElementById('email').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            website: document.getElementById('website').value,
            description: document.getElementById('description').value,
            active: document.getElementById('active').checked
        };

        if (isEditMode.active) await businessesApi.update(isEditMode.id, data);
        else await businessesApi.create(data);
        close();
        loadData();
    }
});
