/**
 * Restaurants User Page Logic
 */

let restaurants = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    await initRestaurants();
});

async function initAuth() {
    const username = localStorage.getItem('username');
    if (username) {
        try {
            currentUser = await usersApi.getByEmail(username);
            console.log('Current User:', currentUser);
        } catch (e) {
            console.error('Failed to load user', e);
        }
    }
}

async function initRestaurants() {
    try {
        restaurants = await restaurantsApi.getAll();
        renderRestaurants(restaurants);
    } catch (e) {
        console.error('Failed to load restaurants', e);
        document.getElementById('restaurant-list').innerHTML = '<p class="text-center text-danger">Failed to load restaurants.</p>';
        // restaurants = []; 
    }
    setupEventListeners();
}

function renderRestaurants(data) {
    const list = document.getElementById('restaurant-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No restaurants found matching your criteria.</p>';
        return;
    }

    data.filter(r => r.active).forEach(restaurant => {
        const card = document.createElement('div');
        card.className = 'card';
        // Handle images
        const img = restaurant.imageUrl || 'https://via.placeholder.com/300x200?text=Dining';

        card.innerHTML = `
            <img src="${img}" alt="${restaurant.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${restaurant.name}</h3>
                    <span class="badge" style="background:var(--warning-color); color:#000;">${restaurant.rating || 4.5} <i class="fas fa-star"></i></span>
                </div>
                <p style="color:var(--text-muted); font-size: 0.9rem; margin: 5px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${restaurant.address}
                </p>
                <div style="margin: 10px 0; color: var(--text-muted);">
                   Cuisine: ${restaurant.cuisineType || 'International'}
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${restaurant.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${restaurant.id}')" style="flex:1;">Details</button>
                    ${currentUser ? `<button class="btn btn-primary btn-sm" onclick="openReservation('${restaurant.id}', '${restaurant.name.replace(/'/g, "\\'")}')" style="flex:1;">Book Table</button>` : ''}
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const cuisineFilter = document.getElementById('cuisineFilter');
    const filterBtn = document.getElementById('filterBtn');

    // Details Modal
    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    // Booking Modal
    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const bookingForm = document.getElementById('bookingForm');

    // Filter Logic
    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const cuisine = cuisineFilter.value;

        const filtered = restaurants.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(term) || r.address.toLowerCase().includes(term);
            const matchesCuisine = cuisine === 'All' || (r.cuisineType && r.cuisineType === cuisine);
            return matchesSearch && matchesCuisine;
        });

        renderRestaurants(filtered);
    };

    filterBtn.addEventListener('click', applyFilters);
    searchInput.addEventListener('input', applyFilters);

    // Modal Close Logic
    const closeAllModals = () => {
        detailsModal.style.display = 'none';
        bookingModal.style.display = 'none';
    };

    closeModal.onclick = closeAllModals;
    closeBookingModal.onclick = closeAllModals;
    window.onclick = (e) => {
        if (e.target == detailsModal || e.target == bookingModal) closeAllModals();
    };

    // Reservation Submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Please login to reserve.');
            return;
        }

        const restaurantId = document.getElementById('bookingRestaurantId').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const guests = document.getElementById('guests').value; // Not in request DTO?
        // Wait, RestaurantReservationRequest DTO does NOT have 'guests' or 'numberOfGuests'.
        // It has check: touristProfileId, restaurantId, reservationDate, reservationTime.
        // So guests count is ignored by backend? Or did I miss it in DTO?
        // Checking DTO again...
        // RestaurantReservationRequest: touristProfileId, restaurantId, reservationDate, reservationTime.
        // NO numberOfGuests. Okay. I will just send what is required or maybe DTO was updated?
        // Let's stick to DTO fields.

        const reservationData = {
            touristProfileId: currentUser.id,
            restaurantId: restaurantId,
            reservationDate: date,
            reservationTime: time + ':00' // Ensure HH:mm:ss
        };

        try {
            await restaurantsApi.reserve(reservationData);

            // Backend supports listing reservations, so we don't strictly need localStorage here, 
            // BUT for `bookings.js` consistency if we want to mix logic, we can store it.
            // Or `bookings.js` can call the API for restaurants.
            // Let's rely on API for restaurants in bookings.js if possible, or store for consistency for now to match Hotels logic.
            // Actually, let's store it too, to avoid complex logic in bookings.js for now.
            const myReservations = JSON.parse(localStorage.getItem('myReservations') || '[]');
            myReservations.push({
                id: Date.now(), // Use created ID if returned? Result contains created obj.
                // But wait, await returns the created object? Yes.
                restaurantName: document.getElementById('bookingRestaurantName').value,
                date: date,
                time: time,
                guests: guests, // Store for display even if backend ignores
                status: 'CONFIRMED'
            });
            localStorage.setItem('myReservations', JSON.stringify(myReservations));

            alert('Table Reserved successfully!');
            closeAllModals();
            bookingForm.reset();
        } catch (err) {
            console.error(err);
            alert('Reservation failed: ' + (err.message || 'Unknown error'));
        }
    });
}

// Global functions
window.showDetails = async (id) => {
    try {
        const restaurant = await restaurantsApi.getById(id);
        if (!restaurant) return;

        const modalBody = document.getElementById('modalBody');
        const img = restaurant.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${restaurant.name}</h2>
            <div style="display:flex; justify-content:space-between; margin: 10px 0;">
                <span class="badge" style="background:var(--warning-color); color:#000;">${restaurant.rating || 4.5} Stars</span>
                <span style="font-weight:bold; color:var(--text-muted);">${restaurant.cuisineType || 'International'}</span>
            </div>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${restaurant.address}</p>
            <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${restaurant.contactNumber || 'N/A'}</p>
            <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${restaurant.email || 'N/A'}</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${restaurant.description || ''}</p>
            ${currentUser ? `<button class="btn btn-primary mt-2" onclick="openReservation('${restaurant.id}', '${restaurant.name.replace(/'/g, "\\'")}')" style="width:100%;">Book Table</button>` : ''}
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};

window.openReservation = (id, name) => {
    document.getElementById('detailsModal').style.display = 'none';

    document.getElementById('bookingRestaurantId').value = id;
    document.getElementById('bookingRestaurantName').value = name;
    document.getElementById('bookingRestaurantDisplay').textContent = `Reservation at: ${name}`;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;

    document.getElementById('bookingModal').style.display = 'flex';
};
