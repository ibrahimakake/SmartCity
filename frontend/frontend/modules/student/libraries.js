/**
 * Libraries User Page Logic
 */

let libraries = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initLibraries();
});

async function initLibraries() {
    try {
        libraries = await librariesApi.getAll();
        renderLibraries(libraries);
    } catch (e) {
        console.error('Failed to load libraries', e);
        document.getElementById('library-list').innerHTML = '<p class="text-center text-danger">Failed to load libraries.</p>';
    }
    setupEventListeners();
}

function renderLibraries(data) {
    const list = document.getElementById('library-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No libraries found matching your criteria.</p>';
        return;
    }

    data.filter(l => l.active).forEach(lib => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = lib.imageUrl || 'https://via.placeholder.com/300x200?text=Library';

        card.innerHTML = `
            <img src="${img}" alt="${lib.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${lib.name}</h3>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${lib.address}
                </p>
                <div style="margin-bottom: 10px; font-size: 0.9rem; font-weight: bold; color: var(--success-color);">
                     Open: ${lib.openTime ? lib.openTime.substring(0, 5) : ''} - ${lib.closeTime ? lib.closeTime.substring(0, 5) : ''}
                </div>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${lib.id}')" style="width:100%;">Details</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const filterBtn = document.getElementById('filterBtn');

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const applyFilters = () => {
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const filtered = libraries.filter(l => l.name.toLowerCase().includes(term) || l.address.toLowerCase().includes(term));
        renderLibraries(filtered);
    };

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
        const lib = await librariesApi.getById(id);
        if (!lib) return;

        const modalBody = document.getElementById('modalBody');
        const img = lib.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${lib.name}</h2>
            <p><strong><i class="fas fa-clock"></i> Hours:</strong> ${lib.openTime} - ${lib.closeTime}</p>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${lib.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${lib.contact}</p>
            <p><strong><i class="fas fa-money-bill-wave"></i> Membership Fee:</strong> $${lib.membershipFee || 0} / year</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${lib.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
