/**
 * Job Listings User Page Logic
 */

let jobs = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initJobListings();
});

async function initJobListings() {
    try {
        jobs = await jobsApi.getAll();
        renderJobs(jobs);
    } catch (e) {
        console.error('Failed to load jobs', e);
        document.getElementById('job-list').innerHTML = '<p class="text-center text-danger">Failed to load jobs.</p>';
    }
    setupEventListeners();
}

function renderJobs(data) {
    const list = document.getElementById('job-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No jobs found matching your criteria.</p>';
        return;
    }

    data.filter(j => j.active).forEach(job => {
        const card = document.createElement('div');
        card.className = 'card';
        // Note: Backend 'JobListing' entity has: title, type, location, salaryRange, description, requirements, postedDate, active.
        // Relationships: company (has name), industry.
        // We need to access nested company name.
        const companyName = job.company ? job.company.name : 'Unknown Company';

        card.innerHTML = `
            <div style="border-left: 4px solid var(--primary-color); padding-left: 15px;">
                <h3 style="margin:0;">${job.title}</h3>
                <h4 style="color:var(--secondary-color); margin: 5px 0;">${companyName}</h4>
                <div style="margin: 10px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--info-color);">${job.type}</span>
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--text-muted);"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                </div>
                <div style="margin-bottom: 10px; font-weight:bold; color:var(--success-color);">
                    <i class="fas fa-money-bill-wave"></i> ${job.salaryRange}
                </div>
                <p style="font-size: 0.9rem; color:var(--text-muted);">Posted: ${new Date(job.postedDate).toLocaleDateString()}</p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-primary btn-sm" onclick="showDetails('${job.id}')" style="width:100%;">View Details & Apply</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter'); // Assuming filter exists
    const filterBtn = document.getElementById('filterBtn');

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const type = typeFilter ? typeFilter.value : 'All';

        const filtered = jobs.filter(job => {
            const companyName = job.company ? job.company.name.toLowerCase() : '';
            const matchesSearch = job.title.toLowerCase().includes(term) || companyName.includes(term);
            const matchesType = type === 'All' || job.type === type;
            return matchesSearch && matchesType;
        });

        renderJobs(filtered);
    };

    if (filterBtn) filterBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);

    const closeAllModals = () => {
        detailsModal.style.display = 'none';
    };

    if (closeModal) closeModal.onclick = closeAllModals;
    window.onclick = (e) => {
        if (e.target == detailsModal) closeAllModals();
    };
}

window.showDetails = async (id) => {
    try {
        const job = await jobsApi.getById(id);
        if (!job) return;

        const modalBody = document.getElementById('modalBody');
        const companyName = job.company ? job.company.name : 'Unknown Company';
        // Requirements might be string or array from backend?
        // Typically backend stores as String or ElementCollection. Let's assume String with newlines or comma for simplicity if array not guaranteed, 
        // OR better: check if array.
        const requirementsList = Array.isArray(job.requirements)
            ? job.requirements.map(r => `<li>${r}</li>`).join('')
            : (job.requirements ? `<li>${job.requirements}</li>` : '');

        modalBody.innerHTML = `
            <h2 style="color: var(--primary-color);">${job.title}</h2>
            <h3 style="color: var(--secondary-color);">${companyName}</h3>
            <div style="margin: 15px 0; display:flex; gap:10px; flex-wrap:wrap;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--info-color);">${job.type}</span>
                <span class="badge" style="background:rgba(255,255,255,0.1); color:white;"><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--success-color);"><i class="fas fa-money-bill-wave"></i> ${job.salaryRange}</span>
            </div>
            <p><strong>Posted On:</strong> ${new Date(job.postedDate).toLocaleDateString()}</p>
            
            <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
            
            <h4>Description</h4>
            <p style="line-height: 1.6; margin-bottom: 20px;">${job.description}</p>
            
            <h4>Requirements</h4>
            <ul style="list-style-type: disk; margin-left: 20px; margin-bottom: 20px;">
                ${requirementsList}
            </ul>

            <button class="btn btn-primary" onclick="alert('Application functionality coming soon!')" style="width:100%; margin-top:20px;">Apply Now</button>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
