/**
 * Admin Business News Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    let industries = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        industryFilter: document.getElementById('industryFilter'),
        sortFilter: document.getElementById('sortFilter'),
        statusFilter: document.getElementById('statusFilter'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
        imgIn: document.getElementById('imageUrl'),
        imgPre: document.getElementById('imagePreview'),
        industrySelect: document.getElementById('industry')
    };

    init();

    async function init() {
        setupEvents();
        await Promise.all([loadData(), loadIndustries()]);
    }

    async function loadData() {
        try {
            entities = await businessNewsApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
            els.table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    async function loadIndustries() {
        try {
            industries = await industriesApi.getAll();
            populateIndustrySelect();
            populateIndustryFilter();
        } catch (e) {
            console.error('Failed to load industries', e);
        }
    }

    function populateIndustrySelect() {
        els.industrySelect.innerHTML = '<option value="">Select Industry</option>';
        industries.forEach(ind => {
            els.industrySelect.innerHTML += `<option value="${ind.id}">${ind.name}</option>`;
        });
    }

    function populateIndustryFilter() {
        // Keep "All"
        els.industryFilter.innerHTML = '<option value="all">All</option>';
        industries.forEach(ind => {
            els.industryFilter.innerHTML += `<option value="${ind.name}">${ind.name}</option>`; // Filter by name for now as table shows names?
            // Actually table renderer uses industry.name. So filter should probably use name logic or ID.
            // HTML filter default was by name.
        });
    }

    function setupEvents() {
        els.search.addEventListener('input', renderTable);
        els.industryFilter.addEventListener('change', renderTable);
        els.sortFilter.addEventListener('change', renderTable);
        els.statusFilter.addEventListener('change', renderTable);
        document.getElementById('addBtn').addEventListener('click', openAdd);
        document.getElementById('closeModal').addEventListener('click', close);
        document.getElementById('cancelBtn').addEventListener('click', close);
        window.addEventListener('click', (e) => { if (e.target === els.modal) close(); });
        els.form.addEventListener('submit', save);
        els.imgIn.addEventListener('input', preview);
    }

    function renderTable() {
        const q = els.search.value.toLowerCase();
        const industry = els.industryFilter.value;
        const sort = els.sortFilter.value;
        const status = els.statusFilter.value;

        let res = entities.filter(e => {
            const matchesSearch = e.title.toLowerCase().includes(q) || (e.summary && e.summary.toLowerCase().includes(q));
            // e.industry might be object
            const indName = e.industry ? e.industry.name : '';
            const matchesIndustry = industry === 'all' || indName === industry;
            const matchesStatus = status === 'all' || (status === 'active' ? e.active : !e.active);
            return matchesSearch && matchesIndustry && matchesStatus;
        });

        // Sort
        res.sort((a, b) => {
            const dateA = new Date(a.publishedAt);
            const dateB = new Date(b.publishedAt);
            return sort === 'newest' ? dateB - dateA : dateA - dateB;
        });

        els.table.innerHTML = '';
        if (res.length === 0) {
            els.table.innerHTML = `<tr><td colspan="7" class="text-center">No news articles found.</td></tr>`;
            return;
        }

        res.forEach(item => {
            const indName = item.industry ? item.industry.name : '-';
            els.table.innerHTML += `
                <tr>
                    <td><img src="${item.imageUrl || 'https://via.placeholder.com/50'}" style="width: 50px; height: 50px; border-radius: 4px; object-fit: cover;" onerror="this.src='https://via.placeholder.com/50'"></td>
                    <td><strong>${item.title}</strong></td>
                    <td>${indName}</td>
                    <td>${item.summary || '-'}</td>
                    <td>${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : '-'}</td>
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
        document.getElementById('modalTitle').textContent = 'Add News Article';
        els.form.reset();
        els.imgPre.src = 'https://via.placeholder.com/150?text=Preview';
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit News Article';
        try {
            const d = await businessNewsApi.getById(id);

            document.getElementById('title').value = d.title;

            if (industries.length === 0) await loadIndustries();
            if (d.industry && d.industry.id) els.industrySelect.value = d.industry.id;

            document.getElementById('summary').value = d.summary || '';
            document.getElementById('content').value = d.content;
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
        if (confirm('Delete article?')) {
            try {
                await businessNewsApi.delete(id);
                loadData();
            } catch (e) {
                console.error(e);
                alert('Deletion failed');
            }
        }
    }

    async function save(e) {
        e.preventDefault();
        const industryId = els.industrySelect.value;
        if (!industryId) {
            alert('Please select an industry');
            return;
        }

        const data = {
            title: document.getElementById('title').value,
            summary: document.getElementById('summary').value,
            content: document.getElementById('content').value,
            active: document.getElementById('active').checked,
            imageUrl: els.imgIn.value
        };

        try {
            if (isEditMode.active) {
                data.industry = { id: industryId }; // Nested object for update (if backend supports)
                await businessNewsApi.update(isEditMode.id, data);
            } else {
                await businessNewsApi.create(data, industryId);
            }
            close();
            loadData();
        } catch (e) {
            console.error(e);
            alert('Operation failed');
        }
    }
});
