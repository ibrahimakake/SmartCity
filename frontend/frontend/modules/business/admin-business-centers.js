/**
 * Admin Business Centers Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        sectorFilter: document.getElementById('sectorFilter'),
        openNowFilter: document.getElementById('openNowFilter'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
        imgIn: document.getElementById('imageUrl'),
        imgPre: document.getElementById('imagePreview')
    };

    init();

    async function init() {
        await loadData();
        setupEvents();
    }

    async function loadData() {
        try {
            entities = await businessCentersApi.getAll();
            renderTable();
        } catch (e) {
            console.error('Failed to load data', e);
            els.table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    function setupEvents() {
        els.search.addEventListener('input', renderTable);
        els.sectorFilter.addEventListener('change', renderTable);
        els.openNowFilter.addEventListener('change', renderTable);
        document.getElementById('addBtn').addEventListener('click', openAdd);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('cancelBtn').addEventListener('click', close);
        window.addEventListener('click', (e) => { if (e.target === els.modal) close(); });
        els.form.addEventListener('submit', save);
        els.imgIn.addEventListener('input', preview);
    }

    function renderTable() {
        const q = els.search.value.toLowerCase();
        const sector = els.sectorFilter.value;
        const openNow = els.openNowFilter.checked;
        const now = new Date();
        const currentTime = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');

        const res = entities.filter(e => {
            const matchesSearch = e.name.toLowerCase().includes(q) || e.sector.toLowerCase().includes(q);
            const matchesSector = sector === 'all' || e.sector === sector;
            let matchesOpen = true;
            if (openNow && e.openTime && e.closeTime) {
                matchesOpen = currentTime >= e.openTime && currentTime <= e.closeTime;
            }
            return matchesSearch && matchesSector && matchesOpen;
        });

        els.table.innerHTML = '';
        if (res.length === 0) {
            els.table.innerHTML = `<tr><td colspan="7" class="text-center">No business centers found.</td></tr>`;
            return;
        }

        res.forEach(item => {
            els.table.innerHTML += `
                <tr>
                    <td><img src="${item.imageUrl || 'https://via.placeholder.com/50'}" class="hotel-thumb" alt="Thumb" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.sector}</td>
                    <td>${item.address}</td>
                    <td>${item.openTime || '-'} - ${item.closeTime || '-'}</td>
                    <td><span class="status-badge ${item.active ? 'status-active' : 'status-inactive'}">${item.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon btn-edit" onclick="edit('${item.id}')"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon btn-delete" onclick="del('${item.id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });
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

    function openAdd() {
        isEditMode.active = false;
        document.getElementById('modalTitle').textContent = 'Add Business Center';
        els.form.reset();
        els.imgPre.src = 'https://via.placeholder.com/150?text=Preview';
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Business Center';
        try {
            const d = await businessCentersApi.getById(id);

            document.getElementById('name').value = d.name;
            document.getElementById('sector').value = d.sector;
            document.getElementById('contact').value = d.contact || '';
            document.getElementById('address').value = d.address;
            document.getElementById('openTime').value = d.openTime || '';
            document.getElementById('closeTime').value = d.closeTime || '';
            document.getElementById('description').value = d.description || '';
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
        if (confirm('Delete business center?')) {
            try {
                await businessCentersApi.delete(id);
                loadData();
            } catch (e) {
                console.error(e);
                alert('Deletion failed');
            }
        }
    }

    async function save(e) {
        e.preventDefault();
        const data = {
            name: document.getElementById('name').value,
            sector: document.getElementById('sector').value,
            contact: document.getElementById('contact').value,
            address: document.getElementById('address').value,
            openTime: document.getElementById('openTime').value + ':00', // Ensure HH:MM:SS format if needed? Time LocalTime expects HH:mm:ss usually. 
            // HTML input time gives HH:mm. Backend LocalTime might need HH:mm:ss. Or might handle HH:mm.
            // Let's safe append :00 if length is 5.
            closeTime: document.getElementById('closeTime').value + ':00',
            description: document.getElementById('description').value,
            active: document.getElementById('active').checked,
            imageUrl: els.imgIn.value
        };
        // Fix time format
        if (data.openTime.length === 5) data.openTime += ':00';
        if (data.closeTime.length === 5) data.closeTime += ':00';
        // Handle empty time
        if (data.openTime === ':00') data.openTime = null;
        if (data.closeTime === ':00') data.closeTime = null;

        try {
            if (isEditMode.active) await businessCentersApi.update(isEditMode.id, data);
            else await businessCentersApi.create(data);
            close();
            loadData();
        } catch (e) {
            console.error(e);
            alert('Operation failed');
        }
    }
});
