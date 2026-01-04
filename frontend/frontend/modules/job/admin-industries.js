/**
 * Admin Industries Logic
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
        await loadData();
        setupEvents();
    }

    async function loadData() {
        entities = await industriesApi.getAll();
        renderTable();
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
        const res = entities.filter(e => e.name.toLowerCase().includes(q));
        els.table.innerHTML = '';
        if (res.length === 0) Els.table.innerHTML = `<tr><td colspan="4" class="text-center">No industries found.</td></tr>`;

        res.forEach(item => {
            els.table.innerHTML += `
                <tr>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.description || '-'}</td>
                    <td>${item.createdAt || '-'}</td>
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
        document.getElementById('modalTitle').textContent = 'Add Industry';
        els.form.reset();
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Industry';
        const d = await industriesApi.getById(id);

        document.getElementById('name').value = d.name;
        document.getElementById('description').value = d.description;

        els.modal.classList.add('show');
    }

    window.del = async (id) => {
        if (confirm('Delete industry?')) { await industriesApi.delete(id); loadData(); }
    }

    async function save(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value
        };

        if (isEditMode.active) await industriesApi.update(isEditMode.id, data);
        else await industriesApi.create(data);
        close();
        loadData();
    }
});
