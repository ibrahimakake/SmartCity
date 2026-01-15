/**
 * Universities User Page Logic
 */

let universities = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initUniversities();
});

async function initUniversities() {
    try {
        universities = await universitiesApi.getAll();
        renderUniversities(universities);
    } catch (e) {
        console.error('Failed to load universities', e);
        document.getElementById('university-list').innerHTML = '<p class="text-center text-danger">Failed to load universities.</p>';
    }
    setupEventListeners();
}

function renderUniversities(data) {
    const list = document.getElementById('university-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No universities found matching your criteria.</p>';
        return;
    }

    data.filter(u => u.active).forEach(uni => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = uni.imageUrl || 'https://via.placeholder.com/300x200?text=University';

        // Handle faculties list (could be array or string depending on backend/frontend mismatch, but backend usually sends array if standardized)
        const faculties = Array.isArray(uni.faculties) ? uni.faculties : (uni.faculties ? [uni.faculties] : []);

        card.innerHTML = `
            <img src="${img}" alt="${uni.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <h3 style="margin:0;">${uni.name}</h3>
                <div style="margin: 5px 0;">
                    ${faculties.slice(0, 2).map(f => `<span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color); margin-right:5px;">${f}</span>`).join('')}
                    ${faculties.length > 2 ? `<span class="badge" style="background:rgba(255,255,255,0.1); color:var(--text-muted);">+${faculties.length - 2}</span>` : ''}
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${uni.address}
                </p>
                <div style="margin-bottom: 10px; font-size: 0.9rem; font-weight: bold; color: var(--warning-color);">
                    <i class="fas fa-trophy"></i> Rank: #${uni.ranking || 'N/A'}
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${uni.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${uni.id}')" style="width:100%;">Details</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const facultyFilter = document.getElementById('facultyFilter');
    const filterBtn = document.getElementById('filterBtn');

    // Details Modal
    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    // Filter Logic
    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const faculty = facultyFilter.value;

        const filtered = universities.filter(uni => {
            const matchesSearch = uni.name.toLowerCase().includes(term) || uni.address.toLowerCase().includes(term);
            // Check if faculties array includes the selected faculty
            const faculties = Array.isArray(uni.faculties) ? uni.faculties : [];
            const matchesFaculty = faculty === 'All' || faculties.includes(faculty);
            return matchesSearch && matchesFaculty;
        });

        renderUniversities(filtered);
    };

    if (filterBtn) filterBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (facultyFilter) facultyFilter.addEventListener('change', applyFilters);

    // Modal Close Logic
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
        const uni = await universitiesApi.getById(id);
        if (!uni) return;

        const modalBody = document.getElementById('modalBody');
        const img = uni.imageUrl || 'https://via.placeholder.com/300x200';
        const faculties = Array.isArray(uni.faculties) ? uni.faculties : (uni.faculties ? [uni.faculties] : []);

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${uni.name}</h2>
            <div style="margin: 10px 0;">
                ${faculties.map(f => `<span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color); margin-right:5px;">${f}</span>`).join('')}
            </div>
            <p><strong><i class="fas fa-trophy"></i> Ranking:</strong> #${uni.ranking || 'N/A'}</p>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${uni.address}</p>
            <p><strong><i class="fas fa-phone"></i> Contact:</strong> ${uni.contact || 'N/A'}</p>
            <p><strong><i class="fas fa-globe"></i> Website:</strong> <a href="${uni.website && uni.website.startsWith('http') ? uni.website : 'http://' + uni.website}" target="_blank" style="color:var(--secondary-color);">${uni.website || 'N/A'}</a></p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${uni.description || ''}</p>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};
