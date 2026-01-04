/**
 * Admin Companies Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    let industries = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
        imgIn: document.getElementById('imageUrl'),
        imgPre: document.getElementById('imagePreview'),
        industrySelect: document.getElementById('industry'),
        tog: document.querySelector('.toggle-sidebar'),
        side: document.querySelector('.sidebar')
    };

    init();

    async function init() {
        await Promise.all([loadData(), loadIndustries()]);
        setupEvents();
    }

    async function loadData() {
        try {
            entities = await companiesApi.getAll();
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
        const res = entities.filter(e =>
            e.name.toLowerCase().includes(q) ||
            (e.industry && e.industry.name && e.industry.name.toLowerCase().includes(q))
        );
        els.table.innerHTML = '';
        if (res.length === 0) {
            els.table.innerHTML = `<tr><td colspan="7" class="text-center">No companies found.</td></tr>`;
            return;
        }

        res.forEach(item => {
            // Note: item.industry might be an object now
            const industryName = item.industry ? item.industry.name : '-';
            els.table.innerHTML += `
                <tr>
                    <td><img src="${item.logoUrl || 'https://via.placeholder.com/50'}" class="hotel-thumb"></td>
                    <td><strong>${item.name}</strong></td>
                    <td>${industryName}</td>
                    <td>${item.sector || '-'}</td>
                    <td>${item.contactNumber || '-'}</td>
                    <td>${item.createdAt || '-'}</td>
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

    function openAdd() {
        isEditMode.active = false;
        document.getElementById('modalTitle').textContent = 'Add Company';
        els.form.reset();
        els.imgPre.src = 'https://via.placeholder.com/150?text=Preview';
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Company';
        try {
            const d = await companiesApi.getById(id);

            document.getElementById('name').value = d.name;
            document.getElementById('address').value = d.address;
            document.getElementById('contact').value = d.contactNumber;
            document.getElementById('email').value = d.email;

            // Set industry select
            // Ensure industries are loaded
            if (industries.length === 0) await loadIndustries();
            if (d.industry && d.industry.id) {
                els.industrySelect.value = d.industry.id;
            }

            document.getElementById('sector').value = d.sector;

            els.imgIn.value = d.logoUrl || '';
            els.imgPre.src = d.logoUrl || 'https://via.placeholder.com/150?text=No+Image';
            els.modal.classList.add('show');
        } catch (e) {
            console.error(e);
            alert('Error loading details');
        }
    }

    window.del = async (id) => {
        if (confirm('Delete company?')) {
            try {
                await companiesApi.delete(id);
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
        const industryId = els.industrySelect.value;
        if (!industryId) {
            alert('Please select an industry');
            return;
        }

        const data = {
            name: document.getElementById('name').value,
            address: document.getElementById('address').value,
            contactNumber: document.getElementById('contact').value,
            email: document.getElementById('email').value,
            sector: document.getElementById('sector').value,
            logoUrl: els.imgIn.value
        };

        try {
            if (isEditMode.active) {
                // For update, the controller might not need industry param if it assumes no change or takes from body?
                // But CompanyController update signature is just Body. 
                // We should probably include industry object in body if we want to update it.
                // Or maybe the backend doesn't support updating industry easily yet.
                // Let's try sending it in body as nested object if possible, or usually DTO expects ID.
                // Since I can't check DTO, I will just call update. If industry doesn't update, so be it for now.
                // But create explicitly asks for param.

                // If I really want to update industry, I might need to send { industry: { id: ... } }
                data.industry = { id: industryId };
                await companiesApi.update(isEditMode.id, data);
            } else {
                await companiesApi.create(data, industryId);
            }
            close();
            loadData();
        } catch (e) {
            console.error(e);
            alert('Operation failed');
        }
    }
});
