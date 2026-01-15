/**
 * Theatres User Page Logic
 */

let theatres = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initAuth();
    await initTheatres();
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

async function initTheatres() {
    try {
        theatres = await theatresApi.getAll();
        renderTheatres(theatres);
    } catch (e) {
        console.error('Failed to load theatres', e);
        document.getElementById('theatre-list').innerHTML = '<p class="text-center text-danger">Failed to load theatres.</p>';
    }
    setupEventListeners();
}

function renderTheatres(data) {
    const list = document.getElementById('theatre-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No theatres found matching your criteria.</p>';
        return;
    }

    data.filter(t => t.active).forEach(theatre => {
        const card = document.createElement('div');
        card.className = 'card';
        const img = theatre.imageUrl || 'https://via.placeholder.com/300x200?text=Cinema';

        card.innerHTML = `
            <img src="${img}" alt="${theatre.name}" style="width:100%; height: 180px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="margin:0;">${theatre.name}</h3>
                </div>
                <p style="color:var(--text-muted); font-size: 0.9rem; margin: 5px 0;">
                    <i class="fas fa-map-marker-alt"></i> ${theatre.address}
                </p>
                <div style="margin: 10px 0; color: var(--text-muted);">
                   Current Show: Blockbuster Movie
                </div>
                <div style="margin: 10px 0; font-weight: bold; color: var(--success-color);">
                    Ticket: $${theatre.ticketPrice || 15}
                </div>
                 <p style="font-size: 0.9rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${theatre.description || ''}
                </p>
                <div class="card-action" style="margin-top: 15px; display: flex; gap: 10px;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${theatre.id}')" style="flex:1;">Details</button>
                    ${currentUser ? `<button class="btn btn-primary btn-sm" onclick="openBooking('${theatre.id}', '${theatre.name.replace(/'/g, "\\'")}', ${theatre.ticketPrice || 15})" style="flex:1;">Book Ticket</button>` : ''}
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const filterBtn = document.getElementById('filterBtn'); // If exists

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const bookingModal = document.getElementById('bookingModal');
    const closeBookingModal = document.getElementById('closeBookingModal');
    const bookingForm = document.getElementById('bookingForm');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const term = searchInput.value.toLowerCase();
            const filtered = theatres.filter(t => t.name.toLowerCase().includes(term) || t.address.toLowerCase().includes(term));
            renderTheatres(filtered);
        });
    }

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

        const theatreId = document.getElementById('bookingTheatreId').value;
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const tickets = parseInt(document.getElementById('tickets').value);
        const price = parseFloat(document.getElementById('bookingPrice').value);
        const totalPrice = tickets * price;

        const bookingData = {
            touristProfileId: currentUser.id,
            theatreId: theatreId,
            showTime: `${date}T${time}:00`, // LocalDateTime format YYYY-MM-DDTHH:mm:ss
            numberOfTickets: tickets,
            totalPrice: totalPrice,
            seatNumbers: 'A1, A2' // Mock seats as frontend UI for seat selection is complex
        };

        try {
            await theatresApi.bookToken(bookingData);

            const myTickets = JSON.parse(localStorage.getItem('myTickets') || '[]');
            myTickets.push({
                id: Date.now(),
                theatreName: document.getElementById('bookingTheatreName').value,
                eventName: 'Movie Show', // Placeholder
                date: date,
                time: time,
                tickets: tickets,
                status: 'CONFIRMED'
            });
            localStorage.setItem('myTickets', JSON.stringify(myTickets));

            alert('Tickets Booked!');
            closeAllModals();
            bookingForm.reset();
        } catch (err) {
            console.error(err);
            alert('Booking failed: ' + (err.message || 'Unknown error'));
        }
    });
}

window.showDetails = async (id) => {
    try {
        const theatre = await theatresApi.getById(id);
        if (!theatre) return;

        const modalBody = document.getElementById('modalBody');
        const img = theatre.imageUrl || 'https://via.placeholder.com/300x200';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 250px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: var(--primary-color);">${theatre.name}</h2>
            <div style="margin: 10px 0;">
                <span style="font-weight:bold; color:var(--success-color);">$${theatre.ticketPrice || 15} / ticket</span>
            </div>
            <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${theatre.address}</p>
            <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${theatre.contactNumber || 'N/A'}</p>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">
            <p style="line-height: 1.6;">${theatre.description || ''}</p>
            ${currentUser ? `<button class="btn btn-primary mt-2" onclick="openBooking('${theatre.id}', '${theatre.name.replace(/'/g, "\\'")}', ${theatre.ticketPrice || 15})" style="width:100%;">Book Ticket</button>` : ''}
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load details');
    }
};

window.openBooking = (id, name, price) => {
    document.getElementById('detailsModal').style.display = 'none';

    document.getElementById('bookingTheatreId').value = id;
    document.getElementById('bookingTheatreName').value = name;
    document.getElementById('bookingTheatreDisplay').textContent = `Booking at: ${name}`;
    document.getElementById('bookingPrice').value = price;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;

    document.getElementById('bookingModal').style.display = 'flex';
};
