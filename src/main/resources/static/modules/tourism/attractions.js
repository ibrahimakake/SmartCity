/**
 * Attractions User Page Logic
 */

const mockAttractions = [
    {
        id: 1,
        name: "Central City Park",
        address: "1 Park Ave, Smart City",
        type: "Park",
        entryFee: "Free",
        description: "A large urban park with walking trails, lakes, and picnic areas.",
        imageUrl: "https://images.unsplash.com/photo-1496347646636-ea47f7d6b37b?auto=format&fit=crop&w=800&q=80",
        active: true,
        openTime: "06:00",
        closeTime: "22:00"
    },
    {
        id: 2,
        name: "Smart City Museum",
        address: "50 Culture Rd, Smart City",
        type: "Museum",
        entryFee: "$15",
        description: "Exhibits showcasing the history and future of technology in the city.",
        imageUrl: "https://images.unsplash.com/photo-1544967082-d9d3fbc2c66c?auto=format&fit=crop&w=800&q=80",
        active: true,
        openTime: "09:00",
        closeTime: "18:00"
    },
    {
        id: 3,
        name: "Old Fort",
        address: "10 Heritage Lane, Smart City",
        type: "Historical Site",
        entryFee: "$10",
        description: "A 16th-century fort offering panoramic views of the city skyline.",
        imageUrl: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
        active: true,
        openTime: "08:00",
        closeTime: "17:00"
    },
    {
        id: 4,
        name: "Victory Monument",
        address: "100 Plaza Sq, Smart City",
        type: "Monument",
        entryFee: "Free",
        description: "A towering monument commemorating the city's founders.",
        imageUrl: "https://images.unsplash.com/photo-1568779946465-b1ab73f1d82f?auto=format&fit=crop&w=800&q=80",
        active: true,
        openTime: "24 Hours",
        closeTime: "24 Hours"
    },
    {
        id: 5,
        name: "Botanical Gardens",
        address: "2 Floral Way, Smart City",
        type: "Park",
        entryFee: "$5",
        description: "Beautiful manicured gardens featuring exotic plants and flowers.",
        imageUrl: "https://images.unsplash.com/photo-1588693481427-463836376483?auto=format&fit=crop&w=800&q=80",
        active: true,
        openTime: "07:00",
        closeTime: "19:00"
    }
];

let attractions = [...mockAttractions];

function initAttractions() {
    renderAttractions(attractions);
    setupEventListeners();
}

function renderAttractions(data) {
    const list = document.getElementById('attraction-list');
    list.innerHTML = '';

    if (data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No attractions found matching your criteria.</p>';
        return;
    }

    data.filter(a => a.active).forEach(attr => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <img src="${attr.imageUrl}" alt="${attr.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;">
            <div style="margin-top: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${attr.name}</h3>
                </div>
                <div style="margin: 5px 0;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${attr.type}</span>
                </div>
                 <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${attr.address}
                </p>
                <div style="margin-bottom: 10px; font-size: 0.9rem; display:flex; justify-content:space-between;">
                    <span><i class="far fa-clock"></i> ${attr.openTime} - ${attr.closeTime}</span>
                    <span style="color:var(--success-color); font-weight:bold;">${attr.entryFee}</span>
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${attr.description}
                </p>
                <div class="card-action" style="margin-top: 15px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails(${attr.id})" style="width:100%;">Details</button>
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

    // Details Modal
    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    // Filter Logic
    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const type = typeFilter.value;

        const filtered = mockAttractions.filter(attr => {
            const matchesSearch = attr.name.toLowerCase().includes(term) || attr.address.toLowerCase().includes(term);
            const matchesType = type === 'All' || attr.type === type;
            return matchesSearch && matchesType;
        });

        renderAttractions(filtered);
    };

    filterBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    typeFilter.addEventListener('change', applyFilters);

    // Modal Close Logic
    const closeAllModals = () => {
        detailsModal.style.display = 'none';
    };

    closeModal.onclick = closeAllModals;
    window.onclick = (e) => {
        if (e.target == detailsModal) closeAllModals();
    };
}

window.showDetails = (id) => {
    const attr = mockAttractions.find(a => a.id === id);
    if (!attr) return;

    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <img src="${attr.imageUrl}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: var(--primary-color);">${attr.name}</h2>
        <div style="margin: 10px 0;">
            <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${attr.type}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin: 10px 0;">
             <p><strong><i class="far fa-clock"></i> Hours:</strong> ${attr.openTime} - ${attr.closeTime}</p>
             <p><strong><i class="fas fa-ticket-alt"></i> Entry:</strong> <span style="color:var(--success-color); font-weight:bold;">${attr.entryFee}</span></p>
        </div>
        <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${attr.address}</p>
        <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
        <p style="line-height: 1.6;">${attr.description}</p>
    `;

    document.getElementById('detailsModal').style.display = 'flex';
};
