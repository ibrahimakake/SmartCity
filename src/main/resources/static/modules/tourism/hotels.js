/**
 * Hotels User Page Logic (Tourist)
 */

let hotels = [];
let currentUser = null;

// Make initialize function available globally
window.initialize = async function () {
  try {
    console.log('Initializing hotels application...');

    // Ensure APIs exist
    if (!window.hotelsApi) throw new Error('hotelsApi not initialized');
    if (!window.usersApi) throw new Error('usersApi not initialized');

    await initAuth();   // user is optional (page can still show hotels without it)
    await initHotels(); // always try hotels

    console.log('Hotels application initialized successfully');
  } catch (error) {
    console.error('Initialization error:', error);
    showTopError('Failed to initialize the application. ' + (error.message || ''));
  }
};

function showTopError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger';
  errorDiv.style.margin = '20px';
  errorDiv.style.padding = '15px';
  errorDiv.textContent = message;
  document.body.prepend(errorDiv);
}

async function initAuth() {
  try {
    // ✅ Use username, not email
    // Ideally set this at login time
    const username = localStorage.getItem('username') || 'tourist';

    // Prefer /me if you add it in backend
    // currentUser = await window.usersApi.getMe();

    // ✅ Use getByUsername (requires backend endpoint /api/users/username/{username})
    currentUser = await window.usersApi.getByUsername(username);

    console.log('Current User:', currentUser);
    return currentUser;
  } catch (e) {
    console.warn('Failed to load user, continuing without user data:', e);
    currentUser = null;
    return null;
  }
}

async function initHotels() {
  const hotelList = document.getElementById('hotel-list');
  if (!hotelList) {
    throw new Error('hotel-list container not found');
  }

  hotelList.innerHTML = `<p class="text-center loading"><i class="fas fa-spinner"></i> Loading hotels...</p>`;

  try {
    console.log('Fetching hotels...');
    hotels = await window.hotelsApi.getAll();
    console.log('Received hotels:', hotels);

    if (!Array.isArray(hotels)) {
      throw new Error('Invalid hotels data format (expected array)');
    }

    // ✅ Keep hotels unless explicitly inactive
    const activeHotels = hotels.filter(h => h && h.active !== false);

    console.log(`Found ${activeHotels.length} active hotels`);

    if (activeHotels.length === 0) {
      showNoHotels(hotelList);
    } else {
      renderHotels(activeHotels);
    }
  } catch (error) {
    console.error('Failed to load hotels:', error);
    hotelList.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.innerHTML = `
      <h4><i class="fas fa-exclamation-triangle"></i> Error Loading Hotels</h4>
      <p>We're having trouble loading the hotels. Please try again later.</p>
      <button class="btn btn-sm btn-outline-secondary mt-2" onclick="window.location.reload()">
        <i class="fas fa-sync-alt"></i> Refresh Page
      </button>
    `;
    hotelList.appendChild(errorDiv);
    hotels = [];
  } finally {
    setupEventListeners();
  }
}

function showNoHotels(container) {
  container.innerHTML = '';
  const noHotelsMsg = document.createElement('div');
  noHotelsMsg.className = 'no-hotels-message';
  noHotelsMsg.innerHTML = `
    <div class="alert alert-info">
      <i class="fas fa-hotel"></i>
      <h3>No Hotels Available</h3>
      <p>No hotels found matching your criteria.</p>
      <p>Please check back later or try adjusting your search filters.</p>
    </div>
  `;
  container.appendChild(noHotelsMsg);
}

function renderHotels(data) {
  const list = document.getElementById('hotel-list');
  if (!list) return;

  list.innerHTML = '';
  console.log('Rendering hotels data:', data);

  if (!Array.isArray(data) || data.length === 0) {
    showNoHotels(list);
    return;
  }

  data.forEach((hotel) => {
    // ✅ Image optional
    const img = hotel.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

    const name = hotel.name || 'Unnamed hotel';
    const address = hotel.address || 'Address not available';
    const starRating = Number(hotel.starRating || 0);
    const startingPrice = hotel.startingPrice ?? 'N/A';
    const description = hotel.description || '';

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <img src="${img}"
           alt="${escapeHtml(name)}"
           style="width:100%; height:180px; object-fit:cover; border-radius: 8px;"
           onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">

      <div style="margin-top: 15px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="margin:0;">${escapeHtml(name)}</h3>
          <span class="badge" style="background:var(--warning-color); color:#000;">
            ${starRating} <i class="fas fa-star"></i>
          </span>
        </div>

        <p style="color:var(--text-muted); font-size:0.9rem; margin:5px 0;">
          <i class="fas fa-map-marker-alt"></i> ${escapeHtml(address)}
        </p>

        <div style="margin:10px 0; font-weight:bold; color: var(--success-color);">
          From $${escapeHtml(String(startingPrice))} / night
        </div>

        <p style="font-size:0.9rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
          ${escapeHtml(description)}
        </p>

        <div style="margin-top: 15px; display:flex; gap:10px;">
          <button class="btn btn-secondary btn-sm" style="flex:1;" onclick="showDetails('${hotel.id}')">
            Details
          </button>

          ${
            currentUser
              ? `<button class="btn btn-primary btn-sm" style="flex:1;" onclick="openBooking('${hotel.id}', '${escapeJs(name)}')">
                   Book Now
                 </button>`
              : ''
          }
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

  const detailsModal = document.getElementById('detailsModal');
  const closeModal = document.getElementById('closeModal');

  const bookingModal = document.getElementById('bookingModal');
  const closeBookingModal = document.getElementById('closeBookingModal');
  const bookingForm = document.getElementById('bookingForm');

  if (!searchInput || !ratingFilter || !priceFilter || !filterBtn) return;

  const applyFilters = () => {
    const term = (searchInput.value || '').toLowerCase();
    const rating = parseInt(ratingFilter.value, 10) || 0;
    const maxPrice = priceFilter.value ? parseFloat(priceFilter.value) : Infinity;

    const filtered = hotels
      .filter(h => h && h.active !== false)
      .filter(hotel => {
        const name = (hotel.name || '').toLowerCase();
        const address = (hotel.address || '').toLowerCase();
        const star = Number(hotel.starRating || 0);

        // startingPrice can be string/number/null
        const price = hotel.startingPrice == null ? 0 : Number(hotel.startingPrice);

        const matchesSearch = name.includes(term) || address.includes(term);
        const matchesRating = star >= rating;
        const matchesPrice = price <= maxPrice;

        return matchesSearch && matchesRating && matchesPrice;
      });

    renderHotels(filtered);
  };

  filterBtn.onclick = applyFilters;
  searchInput.oninput = applyFilters;

  const closeAllModals = () => {
    if (detailsModal) detailsModal.style.display = 'none';
    if (bookingModal) bookingModal.style.display = 'none';
  };

  if (closeModal) closeModal.onclick = closeAllModals;
  if (closeBookingModal) closeBookingModal.onclick = closeAllModals;

  window.onclick = (e) => {
    if (e.target === detailsModal || e.target === bookingModal) closeAllModals();
  };

  if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!currentUser) {
        alert('Please login to book.');
        return;
      }

      const hotelId = document.getElementById('bookingHotelId').value;
      const checkIn = document.getElementById('checkIn').value;
      const checkOut = document.getElementById('checkOut').value;
      const guests = parseInt(document.getElementById('guests').value, 10);

      const hotel = hotels.find(h => String(h.id) === String(hotelId));
      const pricePerNight = hotel && hotel.startingPrice != null ? Number(hotel.startingPrice) : 100;

      const nights = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);
      const totalPrice = (nights > 0 ? nights : 1) * pricePerNight;

      const bookingData = {
        touristProfileId: currentUser.id, // NOTE: this might NOT be touristProfileId in your backend
        hotelId: hotelId,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        totalPrice: totalPrice
      };

      try {
        // ✅ Correct method name: bookRoom()
        const result = await window.hotelsApi.bookRoom(bookingData);

        alert('Booking Confirmed!');
        closeAllModals();
        bookingForm.reset();
      } catch (err) {
        console.error(err);
        alert('Booking failed: ' + (err.message || 'Unknown error'));
      }
    });
  }
}

// Global functions
window.showDetails = async (id) => {
  try {
    const hotel = await window.hotelsApi.getById(id);
    if (!hotel) return;

    const modalBody = document.getElementById('modalBody');
    const img = hotel.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image';

    modalBody.innerHTML = `
      <img src="${img}" style="width:100%; height:250px; object-fit:cover; border-radius:8px; margin-bottom:20px;"
           onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">

      <h2 style="color: var(--primary-color);">${escapeHtml(hotel.name || '')}</h2>

      <div style="display:flex; justify-content:space-between; margin:10px 0;">
        <span class="badge" style="background:var(--warning-color); color:#000;">
          ${Number(hotel.starRating || 0)} Stars
        </span>
        <span style="font-weight:bold; color:var(--success-color);">
          $${escapeHtml(String(hotel.startingPrice ?? 'N/A'))} / night
        </span>
      </div>

      <p><strong><i class="fas fa-map-marker-alt"></i> Address:</strong> ${escapeHtml(hotel.address || 'N/A')}</p>

      <p><strong><i class="fas fa-phone"></i> Phone:</strong> ${escapeHtml(hotel.phoneNumber || 'N/A')}</p>

      <p><strong><i class="fas fa-envelope"></i> Email:</strong> ${escapeHtml(hotel.email || 'N/A')}</p>

      <hr style="border-color: rgba(255,255,255,0.1); margin: 15px 0;">

      <p style="line-height: 1.6;">${escapeHtml(hotel.description || '')}</p>

      ${currentUser ? `<button class="btn btn-primary mt-2" onclick="openBooking('${hotel.id}', '${escapeJs(hotel.name || '')}')" style="width:100%;">Book This Hotel</button>` : ''}
    `;

    document.getElementById('detailsModal').style.display = 'flex';
  } catch (e) {
    console.error(e);
    alert('Failed to load details');
  }
};

window.openBooking = (id, name) => {
  document.getElementById('detailsModal').style.display = 'none';

  document.getElementById('bookingHotelId').value = id;
  document.getElementById('bookingHotelName').value = name;
  document.getElementById('bookingHotelDisplay').textContent = `Booking at: ${name}`;

  const today = new Date().toISOString().split('T')[0];
  document.getElementById('checkIn').min = today;
  document.getElementById('checkOut').min = today;

  document.getElementById('bookingModal').style.display = 'flex';
};

// helpers
function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeJs(str) {
  return String(str).replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}
