/**
 * Companies User Page Logic
 */

let companies = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initCompanies();
});

async function initCompanies() {
    try {
        companies = await companiesApi.getAll();
        renderCompanies(companies);
    } catch (e) {
        console.error('Failed to load companies', e);
        document.getElementById('company-list').innerHTML = '<p class="text-center text-danger">Failed to load companies.</p>';
    }
    setupEventListeners();
}

function renderCompanies(data) {
    const list = document.getElementById('company-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No companies found matching your criteria.</p>';
        return;
    }

    data.filter(c => c.active).forEach(company => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = company.imageUrl || 'https://via.placeholder.com/300x200?text=Company';
        const industryName = company.industry ? company.industry.name : 'General';

        card.innerHTML = `
            <img src="${img}" alt="${company.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${company.name}</h3>
                <div style="margin: 5px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${industryName}</span>
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${company.address}
                </p>
                <div style="margin-bottom: 5px; font-size:0.9rem; color:var(--success-color);">
                    <i class="fas fa-users"></i> ${company.size || 'N/A'}
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${company.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${company.id}')" style="width:100%;">Details</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const industryFilter = document.getElementById('industryFilter');
    const filterBtn = document.getElementById('filterBtn');

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        // const industry = industryFilter.value; // If we implement industry filter we need to fetch industries too. 
        // For now let's just search by name.

        const filtered = companies.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(term) || c.address.toLowerCase().includes(term);
            return matchesSearch;
        });

        renderCompanies(filtered);
    };

    if (filterBtn) filterBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);

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
        const comp = await companiesApi.getById(id);
        if (!comp) return;

        const modalBody = document.getElementById('modalBody');
        const img = comp.imageUrl || 'https://via.placeholder.com/300x200';
        const industryName = comp.industry ? comp.industry.name : 'General';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${comp.name}</h2>
            <div style="margin: 10px 0;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${industryName}</span>
            </div>
            <p><strong><i class="fas fa-users"></i> Size:</strong> <span style="color:var(--success-color);">${comp.size || 'N/A'}</span></p>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${comp.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${comp.contact}</p>
            <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${comp.website && comp.website.startsWith('http') ? comp.website : 'http://' + comp.website}" target="_blank" style="color:var(--secondary-color);">${comp.website || 'N/A'}</a></p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${comp.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
