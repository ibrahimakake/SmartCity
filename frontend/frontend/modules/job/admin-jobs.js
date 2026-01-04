/**
 * Admin Job Listings Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    let entities = [];
    let companies = [];
    let industries = [];
    const isEditMode = { active: false, id: null };
    const els = {
        table: document.getElementById('tableBody'),
        search: document.getElementById('searchInput'),
        modal: document.getElementById('modal'),
        form: document.getElementById('form'),
        companySelect: document.getElementById('company'),
        industrySelect: document.getElementById('industry'),
        tog: document.querySelector('.toggle-sidebar'),
        side: document.querySelector('.sidebar')
    };

    init();

    async function init() {
        await Promise.all([loadData(), loadCompanies(), loadIndustries()]);
        setupEvents();
    }

    async function loadData() {
        try {
            entities = await jobsApi.getAll();
            renderTable();
        } catch (e) {
            console.error(e);
            els.table.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>`;
        }
    }

    async function loadCompanies() {
        try {
            companies = await companiesApi.getAll();
            populateCompanySelect();
        } catch (e) {
            console.error('Failed to load companies', e);
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

    function populateCompanySelect() {
        els.companySelect.innerHTML = '<option value="">Select Company</option>';
        companies.forEach(c => {
            els.companySelect.innerHTML += `<option value="${c.id}">${c.name}</option>`;
        });
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
        if (els.tog) els.tog.addEventListener('click', () => els.side.classList.toggle('active'));
    }

    function renderTable() {
        const q = els.search.value.toLowerCase();
        const res = entities.filter(e =>
            e.title.toLowerCase().includes(q) ||
            (e.company && e.company.name && e.company.name.toLowerCase().includes(q))
        );
        els.table.innerHTML = '';
        if (res.length === 0) {
            els.table.innerHTML = `<tr><td colspan="7" class="text-center">No listings found.</td></tr>`;
            return;
        }

        res.forEach(item => {
            const companyName = item.company ? item.company.name : '-';
            els.table.innerHTML += `
                <tr>
                    <td><strong>${item.title}</strong></td>
                    <td>${companyName}</td>
                    <td>${item.location || '-'}</td>
                    <td><span class="status-badge" style="background: rgba(41, 121, 255, 0.1); color: var(--info-color);">${item.employmentType}</span></td>
                    <td>${item.salary ? item.salary + ' DH' : '-'}</td>
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

    function openAdd() {
        isEditMode.active = false;
        document.getElementById('modalTitle').textContent = 'Add Job Listing';
        els.form.reset();
        els.modal.classList.add('show');
    }

    function close() { els.modal.classList.remove('show'); }

    window.edit = async (id) => {
        isEditMode.active = true;
        isEditMode.id = id;
        document.getElementById('modalTitle').textContent = 'Edit Job Listing';
        try {
            const d = await jobsApi.getById(id);

            document.getElementById('title').value = d.title;

            if (companies.length === 0) await loadCompanies();
            if (d.company && d.company.id) els.companySelect.value = d.company.id;

            if (industries.length === 0) await loadIndustries();
            if (d.industry && d.industry.id) els.industrySelect.value = d.industry.id;

            document.getElementById('location').value = d.location;
            document.getElementById('employmentType').value = d.employmentType;
            document.getElementById('salary').value = d.salary;
            document.getElementById('contact').value = d.contactNumber;
            document.getElementById('email').value = d.email;
            document.getElementById('description').value = d.description;
            document.getElementById('active').checked = d.active;

            els.modal.classList.add('show');
        } catch (e) {
            console.error(e);
            alert('Error loading details');
        }
    }

    window.del = async (id) => {
        if (confirm('Delete listing?')) {
            try {
                await jobsApi.delete(id);
                loadData();
            } catch (e) {
                console.error(e);
                alert('Deletion failed');
            }
        }
    }

    async function save(e) {
        e.preventDefault();
        const companyId = els.companySelect.value;
        const industryId = els.industrySelect.value;

        if (!companyId || !industryId) {
            alert('Please select company and industry');
            return;
        }

        const data = {
            title: document.getElementById('title').value,
            location: document.getElementById('location').value,
            employmentType: document.getElementById('employmentType').value,
            salary: document.getElementById('salary').value,
            contactNumber: document.getElementById('contact').value,
            email: document.getElementById('email').value,
            description: document.getElementById('description').value,
            active: document.getElementById('active').checked
        };

        try {
            if (isEditMode.active) {
                // Similar to Companies, update might not update relations via body alone depending on backend.
                // But Create definitely needs params.
                data.company = { id: companyId };
                data.industry = { id: industryId };
                await jobsApi.update(isEditMode.id, data);
            } else {
                await jobsApi.create(data, companyId, industryId);
            }
            close();
            loadData();
        } catch (e) {
            console.error(e);
            alert('Operation failed');
        }
    }
});
