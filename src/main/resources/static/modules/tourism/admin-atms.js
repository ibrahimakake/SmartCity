/**
 * Admin ATMs Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
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
            entities = await atmsApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
            els.table.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    function setupEvents() {
        els.search.addEventListener('input', renderTable);
        document.getElementById('addBtn').addEventListener('click', openAdd);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('cancelBtn').addEventListener('click', close);
        window.addEventListener('click', (e) => { if (e.target === els.modal) close(); });
        els.form.addEventListener('submit', save);
        if (els.tog) els.tog.addEventListener('click', () => els.side.classList.toggle('active'));
    }

    function renderTable() {
        const q = els.search.value.toLowerCase();
        const res = entities.filter(e =>
            e.name.toLowerCase().includes(q) ||
            e.bankName.toLowerCase().includes(q)
        );
        els.table.innerHTML = '';
        if (res.length === 0) els.table.innerHTML = `<tr><td colspan="5" class="text-center">No ATMs found.</td></tr>`;

        res.forEach(item => {
            els.table.innerHTML += `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.bankName}</td>
                    <td>${item.address}</td>
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
        document.getElementById('modalTitle').textContent = 'Add ATM';
        els.form.reset();
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit ATM';
        const d = await atmsApi.getById(id);
        document.getElementById('name').value = d.name;
        document.getElementById('bankName').value = d.bankName;
        document.getElementById('address').value = d.address;
        document.getElementById('description').value = d.description;
        document.getElementById('active').checked = d.active;
        els.modal.classList.add('show');
    }

    window.del = async (id) => {
        if (confirm('Delete ATM?')) { await atmsApi.delete(id); loadData(); }
    }

    async function save(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            bankName: document.getElementById('bankName').value,
            address: document.getElementById('address').value,
            description: document.getElementById('description').value,
            active: document.getElementById('active').checked
        };

        if (isEditMode.active) await atmsApi.update(isEditMode.id, data);
        else await atmsApi.create(data);

        close();
        loadData();
    }
});
