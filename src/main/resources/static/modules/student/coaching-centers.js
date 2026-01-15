/**
 * Coaching Centers User Page Logic
 */

let coachingCenters = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initCoaching();
});

async function initCoaching() {
    try {
        coachingCenters = await coachingApi.getAll();
        renderCoaching(coachingCenters);
    } catch (e) {
        console.error('Failed to load coaching centers', e);
        document.getElementById('coaching-list').innerHTML = '<p class="text-center text-danger">Failed to load coaching centers.</p>';
    }
    setupEventListeners();
}

function renderCoaching(data) {
    const list = document.getElementById('coaching-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No coaching centers found matching your criteria.</p>';
        return;
    }

    data.filter(c => c.active).forEach(center => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = center.imageUrl || 'https://via.placeholder.com/300x200?text=Coaching';

        card.innerHTML = `
            <img src="${img}" alt="${center.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${center.name}</h3>
                <div style="margin: 5px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${center.specialization || 'General'}</span>
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${center.address}
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
    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const filtered = coachingCenters.filter(c => c.name.toLowerCase().includes(term) || c.specialization.toLowerCase().includes(term));
            renderCoaching(filtered);
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
        const center = await coachingApi.getById(id);
        if (!center) return;

        const modalBody = document.getElementById('modalBody');
        const img = center.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${center.name}</h2>
            <div style="margin: 10px 0;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${center.specialization || 'General'}</span>
            </div>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${center.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${center.contact}</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${center.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
