// Tourism Module Logic

document.addEventListener('DOMContentLoaded', () => {
    // Determine page type based on URL
    const isHotels = window.location.href.includes('hotels.html');
    const isRestaurants = window.location.href.includes('restaurants.html');
    const isTheatres = window.location.href.includes('theatres.html');
    const isAttractions = window.location.href.includes('attractions.html');
    const isBookings = window.location.href.includes('bookings.html');

    if (isHotels) loadEntityData('hotels');
    if (isRestaurants) loadEntityData('restaurants');
    if (isTheatres) loadEntityData('theatres');
    if (isAttractions) loadEntityData('attractions');
    if (isBookings) loadBookings();

    window.addEntity = function () {
        alert('Open Modal: Add New Entity (Mock)');
    }
});

async function loadEntityData(type) {
    const listContainer = document.getElementById('entity-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<p class="text-center">Loading...</p>';

    // Fetch mock data
    // In real app: api.get(`/tourism/${type}`)
    const data = await api.get(type); // Uses key matching in mock api.js

    renderEntities(data, type);
}

function renderEntities(data, type) {
    const listContainer = document.getElementById('entity-list');
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    listContainer.innerHTML = '';

    if (data.length === 0) {
        listContainer.innerHTML = '<p class="text-center">No items found.</p>';
        return;
    }

    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card entity-card';

        let actionsHtml = '';

        if (isAdmin) {
            actionsHtml = `
                <button class="btn btn-primary" onclick="alert('Edit ID: ${item.id}')">Edit</button>
                <button class="btn btn-danger" onclick="alert('Delete ID: ${item.id}')">Delete</button>
            `;
        } else if (role === 'TOURIST') {
            const actionLabel = type === 'hotels' ? 'Book Room' :
                type === 'restaurants' ? 'Reserve Table' :
                    type === 'theatres' ? 'Buy Ticket' : 'Visit Details';
            actionsHtml = `
                <button class="btn btn-primary" onclick="openBookingModal('${item.name}')">${actionLabel}</button>
            `;
        }

        div.innerHTML = `
            <div class="entity-info">
                <h3>${item.name}</h3>
                <p>${item.address || item.cuisine || 'Details available'}</p>
                <p>Rating: ${item.rating || 'N/A'}/5</p>
            </div>
            <div class="entity-actions">
                ${actionsHtml}
            </div>
        `;
        listContainer.appendChild(div);
    });
}

// Booking Logic
function openBookingModal(entityName) {
    // Simple mock
    const confirm = window.confirm(`Do you want to book ${entityName}?`);
    if (confirm) {
        alert('Booking Confirmed! (Mock)');
    }
}

async function loadBookings() {
    const listContainer = document.getElementById('booking-list');
    if (!listContainer) return;

    // Mock bookings
    const bookings = [
        { id: 101, place: 'Grand Hotel', date: '2025-01-15', status: 'Confirmed' },
        { id: 102, place: 'The Gourmet', date: '2025-01-16', status: 'Pending' }
    ];

    listContainer.innerHTML = '';
    bookings.forEach(b => {
        const div = document.createElement('div');
        div.className = 'card entity-card';
        div.innerHTML = `
             <div class="entity-info">
                <h3>${b.place}</h3>
                <p>Date: ${b.date}</p>
                <p>Status: <span style="color: green">${b.status}</span></p>
            </div>
            <div class="entity-actions">
                <button class="btn btn-primary" onclick="alert('Update Booking ${b.id}')">Update</button>
                <button class="btn btn-danger" onclick="alert('Cancel Booking ${b.id}')">Cancel</button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}
