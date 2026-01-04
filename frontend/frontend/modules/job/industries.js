/**
 * Industries User Page Logic
 */

let industries = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initIndustries();
});

async function initIndustries() {
    try {
        industries = await industriesApi.getAll();
        renderIndustries(industries);
    } catch (e) {
        console.error('Failed to load industries', e);
        document.getElementById('industry-list').innerHTML = '<p class="text-center text-danger">Failed to load industries.</p>';
    }
    setupEventListeners();
}

function renderIndustries(data) {
    const list = document.getElementById('industry-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No industries found matching your criteria.</p>';
        return;
    }

    data.filter(i => i.active).forEach(ind => {
        const card = document.createElement('div');
        card.className = 'card';
        // Mock had imageUrl, backend Industry entity might not. Check backend if needed.
        // Assuming backend Industry entity is simple. Let's start with NO image or placeholder.
        const img = 'https://via.placeholder.com/300x200?text=Industry';

        card.innerHTML = `
            <img src="${img}" alt="${ind.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${ind.name}</h3>
                <div style="margin: 5px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${ind.sector || 'General'}</span>
                </div>
                 <div style="margin-bottom: 5px; font-weight:bold; color:var(--success-color);">
                    <i class="fas fa-chart-line"></i> Growth: ${ind.growthRate || 'N/A'}
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${ind.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${ind.id}')" style="width:100%;">Details</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const filtered = industries.filter(i => i.name.toLowerCase().includes(term));
            renderIndustries(filtered);
        });
    }

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
        const ind = await industriesApi.getById(id);
        if (!ind) return;

        const modalBody = document.getElementById('modalBody');
        const img = 'https://via.placeholder.com/300x200?text=Industry';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${ind.name}</h2>
            <div style="margin: 10px 0;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${ind.sector || 'General'} Sector</span>
            </div>
            <p><strong><i class="fas fa-chart-line"></i> Annual Growth:</strong> <span style="color:var(--success-color);">${ind.growthRate || 'N/A'}</span></p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${ind.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
