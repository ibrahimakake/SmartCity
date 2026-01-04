/**
 * Hotels User Page Logic
 */

let hotels = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    await initHotels();
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

async function initHotels() {
    try {
        hotels = await hotelsApi.getAll();
        renderHotels(hotels);
    } catch (e) {
        console.error('Failed to load hotels', e);
        document.getElementById('hotel-list').innerHTML = '<p class="text-center text-danger">Failed to load hotels.</p>';
        hotels = []; // Fallback empty
        // Mock data fallback if desired, but instruction says "Replace mock authentication with real API calls only".
    }
    setupEventListeners();
}

function renderHotels(data) {
    const list = document.getElementById('hotel-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No hotels found matching your criteria.</p>';
        return;
    }

    data.filter(h => h.active).forEach(hotel => {
        const card = document.createElement('div');
        card.className = 'card';
        // Handle images: backend provides imageUrl string, mock had it too.
        const img = hotel.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

        card.innerHTML = `
            <img src="${img}" alt="${hotel.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${hotel.name}</h3>
                    <span class="badge" style="background:var(--warning-color); color:#000;">${hotel.starRating} <i class="fas fa-star"></i></span>
                </div>
                <p style="color:var(--text-muted); font-size: 0.9rem; margin: 5px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${hotel.address}
                </p>
                <div style="margin: 10px 0; font-weight: bold; color: var(--success-color);">
                    From $${hotel.startingPrice || 'N/A'} / night
                </div>
                <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${hotel.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${hotel.id}')" style="flex:1;">Details</button>
                    ${currentUser ? `<button class="btn btn-primary btn-sm" onclick="openBooking('${hotel.id}', '${hotel.name.replace(/'/g, "\\'")}')" style="flex:1;">Book Now</button>` : ''}
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const ratingFilter = document.getElementById('ratingFilter');
    const priceFilter = document.getElementById('priceFilter');
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
        const rating = parseInt(ratingFilter.value) || 0;
        const maxPrice = parseFloat(priceFilter.value) || Infinity;

        const filtered = hotels.filter(hotel => {
            const matchesSearch = hotel.name.toLowerCase().includes(term) || hotel.address.toLowerCase().includes(term);
            const matchesRating = hotel.starRating >= rating;
            const matchesPrice = (hotel.startingPrice || 0) <= maxPrice;
            return matchesSearch && matchesRating && matchesPrice;
        });

        renderHotels(filtered);
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

    // Booking Submission
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert('Please login to book.');
            return;
        }

        const hotelId = document.getElementById('bookingHotelId').value;
        const checkIn = document.getElementById('checkIn').value; // YYYY-MM-DD
        const checkOut = document.getElementById('checkOut').value; // YYYY-MM-DD
        const guests = parseInt(document.getElementById('guests').value);

        // Calculate total price (Mock calculation)
        const hotel = hotels.find(h => h.id == hotelId); // Loose equality for string/int match
        const pricePerNight = hotel ? hotel.startingPrice : 100;
        const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
        const totalPrice = (nights > 0 ? nights : 1) * pricePerNight;

        const bookingData = {
            touristProfileId: currentUser.id, // User ID as Profile ID
            hotelId: hotelId,
            checkInDate: checkIn,
            checkOutDate: checkOut,
            numberOfGuests: guests,
            totalPrice: totalPrice
        };

        try {
            const result = await hotelsApi.book(bookingData);

            // Store ID locally to allow "My Bookings" list (workaround for missing list endpoint)
            const myBookings = JSON.parse(localStorage.getItem('myHotelBookings') || '[]');
            myBookings.push({
                id: result.id,
                hotelName: hotel ? hotel.name : 'Unknown Hotel',
                checkIn: checkIn,
                checkOut: checkOut,
                guests: guests,
                status: 'CONFIRMED' // Backend default? 
            });
            localStorage.setItem('myHotelBookings', JSON.stringify(myBookings));

            alert('Booking Confirmed!');
            closeAllModals();
            bookingForm.reset();
        } catch (err) {
            console.error(err);
            alert('Booking failed: ' + (err.message || 'Unknown error'));
        }
    });
}

// Global functions
window.showDetails = async (id) => {
    // Prefer fetching fresh details
    try {
        const hotel = await hotelsApi.getById(id);
        if (!hotel) return;

        const modalBody = document.getElementById('modalBody');
        const img = hotel.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${hotel.name}</h2>
            <div style="display:flex; justify-content:space-between; margin: 10px 0;">
                <span class="badge" style="background:var(--warning-color); color:#000;">${hotel.starRating} Stars</span>
                <span style="font-weight:bold; color:var(--success-color);">$${hotel.startingPrice} / night</span>
            </div>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${hotel.address}</p>
            <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${hotel.contactNumber || 'N/A'}</p>
            <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${hotel.email || 'N/A'}</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${hotel.description}</p>
            ${currentUser ? `<button class="btn btn-primary mt-2" onclick="openBooking('${hotel.id}', '${hotel.name.replace(/'/g, "\\'")}')" style="width:100%;">Book This Hotel</button>` : ''}
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};

window.openBooking = (id, name) => {
    // Close details if open
    document.getElementById('detailsModal').style.display = 'none';

    document.getElementById('bookingHotelId').value = id;
    document.getElementById('bookingHotelName').value = name;
    document.getElementById('bookingHotelDisplay').textContent = `Booking at: ${name}`;

    // Set min dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('checkIn').min = today;
    document.getElementById('checkOut').min = today;

    document.getElementById('bookingModal').style.display = 'flex';
};
