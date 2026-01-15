/**
 * Businesses User Page Logic
 */

let businesses = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initBusinesses();
});

async function initBusinesses() {
    try {
        businesses = await businessesApi.getAll();
        renderBusinesses(businesses);
    } catch (e) {
        console.error('Failed to load businesses', e);
        document.getElementById('business-list').innerHTML = '<p class="text-center text-danger">Failed to load businesses.</p>';
    }
    setupEventListeners();
}

function renderBusinesses(data) {
    const list = document.getElementById('business-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No businesses found matching your criteria.</p>';
        return;
    }

    data.filter(b => b.active).forEach(biz => {
        const card = document.createElement('div');
        card.className = 'card';
        // Backend Business entity: name, sector, contactInfo (phone?), email, website, description, address, active. 
        // Note: `contact` in mock, `contactInfo` in backend likely.
        // Note: `sector` is String.

        card.innerHTML = `
            <div style="padding-top: 10px;">
                <h3 style="margin:0; color:var(--primary-color);">${biz.name}</h3>
                <div style="margin: 10px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--secondary-color);">${biz.sector || 'General'}</span>
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${biz.address}
                </p>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${biz.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${biz.id}')" style="width:100%;">Details</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const sectorFilter = document.getElementById('sectorFilter');
    const filterBtn = document.getElementById('filterBtn');

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const sector = sectorFilter ? sectorFilter.value : 'All';

        const filtered = businesses.filter(biz => {
            const matchesSearch = biz.name.toLowerCase().includes(term) || biz.address.toLowerCase().includes(term);
            const matchesSector = sector === 'All' || (biz.sector && biz.sector === sector);
            return matchesSearch && matchesSector;
        });

        renderBusinesses(filtered);
    };

    if (filterBtn) filterBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (sectorFilter) sectorFilter.addEventListener('change', applyFilters);

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
        const biz = await businessesApi.getById(id);
        if (!biz) return;

        const modalBody = document.getElementById('modalBody');

        modalBody.innerHTML = `
            <h2 style="color: var(--primary-color);">${biz.name}</h2>
            <div style="margin: 10px 0;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--secondary-color);">${biz.sector || 'General'}</span>
            </div>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${biz.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${biz.contactInfo || biz.contact || 'N/A'}</p>
            <p><strong><i class="fas fa-envelope"></i> Email:</strong> <a href="mailto:${biz.email}" style="color:var(--info-color);">${biz.email || 'N/A'}</a></p>
            <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${biz.website && biz.website.startsWith('http') ? biz.website : 'http://' + biz.website}" target="_blank" style="color:var(--secondary-color);">${biz.website || 'N/A'}</a></p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${biz.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
