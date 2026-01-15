/**
 * Bookings User Page Logic
 */

const currentUser = { id: localStorage.getItem('touristProfileId') || localStorage.getItem('userId') }; // Fallback to handle identity

async function initBookings() {
    // We need the user ID. In a real app, we might get this from a 'me' endpoint or token.
    // For now, let's assume it's stored or we can parse it.
    // Frontend auth.js stores 'username' (email) and 'role'. 
    // Ideally we'd need to fetch the profile ID first if not stored.
    // For this fix, let's try to fetch user details if ID is missing.

    if (!currentUser.id) {
        const username = localStorage.getItem('username');
        if (username) {
            try {
                const user = await usersApi.getByEmail(username);
                currentUser.id = user.id;
            } catch (e) {
                console.error('Failed to resolve user ID', e);
            }
        }
    }

    if (currentUser.id) {
        await renderHotelBookings();
    } else {
        document.getElementById('hotel-bookings-list').innerHTML = '<p class="text-center text-danger">Please login to view bookings.</p>';
    }

    renderRestaurantBookings(); // Still local storage for now (out of scope to fix all today unless requested)
    renderTicketBookings();     // Still local storage for now
}

function switchTab(tabName) {
    document.getElementById('hotels-tab').style.display = 'none';
    document.getElementById('restaurants-tab').style.display = 'none';
    document.getElementById('tickets-tab').style.display = 'none';

    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`${tabName}-tab`).style.display = 'block';

    const iconClass = tabName === 'hotels' ? 'fa-hotel' : (tabName === 'restaurants' ? 'fa-utensils' : 'fa-ticket-alt');
    const clickedBtn = Array.from(document.querySelectorAll('.tab-btn')).find(btn => btn.innerHTML.includes(iconClass));
    if (clickedBtn) clickedBtn.classList.add('active');
}

async function renderHotelBookings() {
    const list = document.getElementById('hotel-bookings-list');
    list.innerHTML = '<p class="text-center">Loading bookings...</p>';

    try {
        const bookings = await hotelsApi.getMyBookings(currentUser.id);

        list.innerHTML = '';
        if (!bookings || bookings.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No hotel bookings found.</p>';
            return;
        }

        bookings.forEach(b => {
            const item = document.createElement('div');
            item.className = 'booking-card';
            // Backend returns: id, hotel { name }, checkInDate, checkOutDate, numberOfGuests, status
            item.innerHTML = `
                <div class="booking-info">
                    <h3>${b.hotel ? b.hotel.name : 'Unknown Hotel'}</h3>
                    <p><i class="far fa-calendar-alt"></i> Check-in: ${b.checkInDate} | Check-out: ${b.checkOutDate}</p>
                    <p><i class="fas fa-users"></i> Guests: ${b.numberOfGuests}</p>
                    <span class="status-badge status-${b.status.toLowerCase()}">${b.status}</span>
                </div>
                <div>
                    ${b.status !== 'CANCELLED' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('hotel', '${b.id}')">Cancel</button>` : ''}
                </div>
            `;
            list.appendChild(item);
        });

    } catch (error) {
        console.error('Failed to load hotel bookings', error);
        list.innerHTML = '<p class="text-center text-danger">Failed to load bookings.</p>';
    }
}

async function renderRestaurantBookings() {
    const list = document.getElementById('restaurant-bookings-list');
    list.innerHTML = '<p class="text-center">Loading reservations...</p>';

    try {
        const bookings = await restaurantsApi.getMyReservations(currentUser.id);

        list.innerHTML = '';
        if (!bookings || bookings.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No restaurant reservations found.</p>';
            return;
        }

        bookings.forEach(b => {
            const item = document.createElement('div');
            item.className = 'booking-card';
            // Backend returns: id, restaurant { name }, reservationDate, reservationTime, numberOfGuests, status
            item.innerHTML = `
                <div class="booking-info">
                    <h3>${b.restaurant ? b.restaurant.name : 'Unknown Restaurant'}</h3>
                    <p><i class="far fa-calendar-alt"></i> Date: ${b.reservationDate} at ${b.reservationTime}</p>
                     <p><i class="fas fa-users"></i> Guests: ${b.numberOfGuests}</p>
                    <span class="status-badge status-${b.status ? b.status.toLowerCase() : 'confirmed'}">${b.status}</span>
                </div>
                <div>
                    ${b.status !== 'CANCELLED' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('restaurant', '${b.id}')">Cancel</button>` : ''}
                </div>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load restaurant reservations', error);
        list.innerHTML = '<p class="text-center text-danger">Failed to load reservations.</p>';
    }
}

async function renderTicketBookings() {
    const list = document.getElementById('ticket-bookings-list');
    list.innerHTML = '<p class="text-center">Loading tickets...</p>';

    try {
        const bookings = await theatresApi.getMyBookings(currentUser.id);

        list.innerHTML = '';
        if (!bookings || bookings.length === 0) {
            list.innerHTML = '<p class="text-center text-muted">No tickets booked.</p>';
            return;
        }

        bookings.forEach(b => {
            const item = document.createElement('div');
            item.className = 'booking-card';
            // Backend: id, theatre { name }, showTime, numberOfTickets, status
            item.innerHTML = `
                <div class="booking-info">
                    <h3>${b.theatre ? b.theatre.name : 'Unknown Theatre'}</h3>
                    <p style="font-weight:bold; color:white;">Movie/Show</p> <!-- Backend doesn't store movie name in booking yet, simplistic -->
                    <p><i class="far fa-calendar-alt"></i> ${b.showTime}</p>
                    <p><i class="fas fa-ticket-alt"></i> Tickets: ${b.numberOfTickets}</p>
                    <span class="status-badge status-${b.status ? b.status.toLowerCase() : 'confirmed'}">${b.status}</span>
                </div>
                <div>
                     ${b.status !== 'CANCELLED' ? `<button class="btn btn-danger btn-sm" onclick="cancelBooking('ticket', '${b.id}')">Cancel</button>` : ''}
                </div>
            `;
            list.appendChild(item);
        });
    } catch (error) {
        console.error('Failed to load tickets', error);
        list.innerHTML = '<p class="text-center text-danger">Failed to load tickets.</p>';
    }
}

window.cancelBooking = async (type, id) => {
    if (!confirm('Are you sure you want to cancel this?')) return;

    try {
        if (type === 'hotel') {
            await hotelsApi.cancelBooking(id);
            renderHotelBookings();
        } else if (type === 'restaurant') {
            await restaurantsApi.cancelReservation(id);
            renderRestaurantBookings();
        } else if (type === 'ticket') {
            await theatresApi.cancelBooking(id);
            renderTicketBookings();
        }
        alert('Cancelled successfully.');
    } catch (error) {
        console.error('Cancellation failed', error);
        alert('Failed to cancel.');
    }
};
