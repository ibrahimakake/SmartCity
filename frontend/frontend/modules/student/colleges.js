/**
 * Colleges User Page Logic
 */

let colleges = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initColleges();
});

async function initColleges() {
    try {
        colleges = await collegesApi.getAll();
        renderColleges(colleges);
    } catch (e) {
        console.error('Failed to load colleges', e);
        document.getElementById('college-list').innerHTML = '<p class="text-center text-danger">Failed to load colleges.</p>';
    }
    setupEventListeners();
}

function renderColleges(data) {
    const list = document.getElementById('college-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No colleges found matching your criteria.</p>';
        return;
    }

    data.filter(c => c.active).forEach(college => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = college.imageUrl || 'https://via.placeholder.com/300x200?text=College';

        card.innerHTML = `
            <img src="${img}" alt="${college.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${college.name}</h3>
                <div style="margin: 5px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${college.type || 'General'}</span>
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${college.address}
                </p>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${college.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${college.id}')" style="width:100%;">Details</button>
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
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const type = typeFilter ? typeFilter.value : 'All';

        const filtered = colleges.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(term) || c.address.toLowerCase().includes(term);
            const matchesType = type === 'All' || (c.type && c.type === type);
            return matchesSearch && matchesType;
        });

        renderColleges(filtered);
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
        const college = await collegesApi.getById(id);
        if (!college) return;

        const modalBody = document.getElementById('modalBody');
        const img = college.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${college.name}</h2>
            <div style="margin: 10px 0;">
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${college.type || 'General'}</span>
            </div>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${college.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${college.contact}</p>
            <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${college.website && college.website.startsWith('http') ? college.website : 'http://' + college.website}" target="_blank" style="color:var(--secondary-color);">${college.website || 'N/A'}</a></p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${college.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
