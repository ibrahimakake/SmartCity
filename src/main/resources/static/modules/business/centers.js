/**
 * Business Centers User Page Logic
 */

let centers = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initCenters();
});

async function initCenters() {
    try {
        centers = await businessCentersApi.getAll();
        renderCenters(centers);
    } catch (e) {
        console.error('Failed to load centers', e);
        document.getElementById('center-list').innerHTML = '<p class="text-center text-danger">Failed to load business centers.</p>';
    }
    setupEventListeners();
}

function renderCenters(data) {
    const list = document.getElementById('center-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No business centers found matching your criteria.</p>';
        return;
    }

    data.filter(c => c.active).forEach(center => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = center.imageUrl || 'https://via.placeholder.com/300x200?text=Business+Center';

        card.innerHTML = `
            <img src="${img}" alt="${center.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${center.name}</h3>
                <div style="margin: 5px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${center.type || 'Office Space'}</span>
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${center.address}
                </p>
                <div style="margin-bottom: 5px; font-weight:bold; color:var(--success-color);">
                    <i class="fas fa-money-bill-wave"></i> From $${center.price || 0}/mo
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${center.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${center.id}')" style="width:100%;">Details</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const filterBtn = document.getElementById('filterBtn');

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const type = typeFilter ? typeFilter.value : 'All';

        const filtered = centers.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(term) || c.address.toLowerCase().includes(term);
            const matchesType = type === 'All' || (c.type && c.type === type);
            return matchesSearch && matchesType;
        });

        renderCenters(filtered);
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
        const center = await businessCentersApi.getById(id);
        if (!center) return;

        const modalBody = document.getElementById('modalBody');
        const img = center.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${center.name}</h2>
            <div style="margin: 10px 0;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${center.type || 'Office Space'}</span>
            </div>
            <p><strong><i class="fas fa-money-bill-wave"></i> Price:</strong> <span style="color:var(--success-color);">$${center.price || 0} / month</span></p>
            <p><strong><i class="fas fa-ruler-combined"></i> Capacity:</strong> ${center.capacity || 'N/A'}</p>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${center.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${center.contact}</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${center.description || ''}</p>
            <button class="btn btn-primary" onclick="alert('Booking functionality coming soon!')" style="width:100%; margin-top:20px;">Book Space</button>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
