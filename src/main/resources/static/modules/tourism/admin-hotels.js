/**
 * Admin Hotels Page Logic
 * Handles Data Table rendering, CRUD operations, and Modal interactions.
 */

(function() {
  console.log('admin-hotels.js loaded ✅');

  // ✅ FIX: bind the window api client into a real variable for this file
  const hotelsApi = window.hotelsApi;

  if (!hotelsApi) {
    console.error('[AdminHotels] window.hotelsApi is missing. Check load order: api.js -> hotelsApi.js -> admin-hotels.js');
    return;
  }

  // --- State ---
  let hotels = [];
  let currentPage = 1;
  const itemsPerPage = 5;
  let currentFilter = 'all';
  let searchQuery = '';
  const isEditMode = { active: false, id: null };

  // --- DOM Elements ---
  const tableBody = document.getElementById('hotelsTableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  const modal = document.getElementById('hotelModal');
  const modalTitle = document.getElementById('modalTitle');
  const hotelForm = document.getElementById('hotelForm');
  const addBtn = document.getElementById('addHotelBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');

  const imageInput = document.getElementById('hotelImage');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');

  const required = [
    { el: tableBody, name: '#hotelsTableBody' },
    { el: modal, name: '#hotelModal' },
    { el: hotelForm, name: '#hotelForm' },
    { el: addBtn, name: '#addHotelBtn' },
  ];

  for (const r of required) {
    if (!r.el) {
      console.error(`Missing required element: ${r.name} ❌`);
      return;
    }
  }

  console.log('All required elements found ✅');

  const placeholderSVG =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="14"%3EPreview%3C/text%3E%3C/svg%3E';

  const noImageSVG =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

  const invalidURLSVG =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23ffebee"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23c62828" font-family="Arial" font-size="12"%3EInvalid URL%3C/text%3E%3C/svg%3E';

  const toNumberOrNull = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // Initialize immediately
  setupEventListeners();
  loadHotels();

  async function loadHotels() {
    try {
      renderLoading();
      hotels = await hotelsApi.getAll();
      console.log('Hotels loaded:', hotels.length);
      renderTable();
    } catch (error) {
      console.error('Failed to load hotels', error);
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
  }

  function setupEventListeners() {
    console.log('[AdminHotels] Setting up event listeners...');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target.value || '').toLowerCase();
        currentPage = 1;
        renderTable();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        currentFilter = e.target.value;
        currentPage = 1;
        renderTable();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderTable();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(getFilteredHotels().length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
    }

    // Modal controls
    addBtn.addEventListener('click', () => {
      console.log('Add Hotel button clicked!');
      openAddModal();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }

    window.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });

    hotelForm.addEventListener('submit', handleFormSubmit);

    if (imageInput) {
      imageInput.addEventListener('input', handleImagePreview);
    }

    tableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit"]');
      const delBtn = e.target.closest('[data-action="delete"]');

      if (editBtn) {
        const id = editBtn.dataset.id;
        await openEditModal(id);
        return;
      }
      if (delBtn) {
        const id = delBtn.dataset.id;
        await deleteHotel(id);
      }
    });

    console.log('[AdminHotels] Event listeners setup complete ✅');
  }

  function getFilteredHotels() {
    return hotels.filter((hotel) => {
      const name = (hotel.name || '').toLowerCase();
      const address = (hotel.address || '').toLowerCase();

      const matchesSearch = name.includes(searchQuery) || address.includes(searchQuery);
      const matchesFilter =
        currentFilter === 'all' ||
        (currentFilter === 'active' && !!hotel.active) ||
        (currentFilter === 'inactive' && !hotel.active);

      return matchesSearch && matchesFilter;
    });
  }

  function renderTable() {
    const filtered = getFilteredHotels();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    console.log('Rendering table. Hotel prices:', pageData.map(h => ({
      id: h.id.substring(0, 8),
      name: h.name,
      startingPrice: h.startingPrice
    })));

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="9" class="text-center">No hotels found.</td></tr>`;
      updatePagination(0, 0);
      return;
    }

    for (const hotel of pageData) {
      const row = document.createElement('tr');

      const stars = '⭐'.repeat(Number(hotel.starRating || 0));
      const price = hotel.startingPrice != null && hotel.startingPrice !== '' ? `DH ${hotel.startingPrice}` : '-';
      const statusClass = hotel.active ? 'status-active' : 'status-inactive';
      const statusText = hotel.active ? 'Active' : 'Inactive';
      const phone = hotel.phoneNumber || 'N/A';

      console.log(`Rendering row for ${hotel.name}: startingPrice=${hotel.startingPrice}, displaying="${price}"`);

      row.innerHTML = `
        <td><img src="${hotel.imageUrl || noImageSVG}" class="hotel-thumb" alt="Thumb"></td>
        <td><strong>${hotel.name || '-'}</strong></td>
        <td>${hotel.address || '-'}</td>
        <td>
          <small>Email: ${hotel.email || 'N/A'}</small><br>
          <small>Tel: ${phone}</small>
        </td>
        <td>${stars}</td>
        <td>${hotel.rating ?? '-'}</td>
        <td>${price}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Edit" data-action="edit" data-id="${hotel.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" title="Delete" data-action="delete" data-id="${hotel.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    }

    updatePagination(currentPage, totalPages);
  }

  function renderLoading() {
    tableBody.innerHTML = `<tr><td colspan="9" class="text-center">Loading hotels...</td></tr>`;
  }

  function updatePagination(current, total) {
    if (!pageInfo || !prevBtn || !nextBtn) return;
    pageInfo.textContent = `Page ${current} of ${total}`;
    prevBtn.disabled = current <= 1;
    nextBtn.disabled = current >= total;
  }

  function openAddModal() {
    console.log('Opening Add Modal...');
    isEditMode.active = false;
    isEditMode.id = null;

    modalTitle.textContent = 'Add New Hotel';
    hotelForm.reset();

    if (imageInput) imageInput.value = '';
    if (imagePreview) imagePreview.src = placeholderSVG;
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';

    clearErrors();
    openModal();
  }

  async function openEditModal(id) {
    console.log('Opening Edit Modal for ID:', id);
    isEditMode.active = true;
    isEditMode.id = id;
    modalTitle.textContent = 'Edit Hotel';
    clearErrors();

    try {
      const hotel = await hotelsApi.getById(id);
      if (!hotel) return;

      document.getElementById('name').value = hotel.name || '';
      document.getElementById('address').value = hotel.address || '';
      document.getElementById('email').value = hotel.email || '';
      document.getElementById('phone').value = hotel.phoneNumber || '';
      document.getElementById('starRating').value = hotel.starRating ?? '';
      document.getElementById('rating').value = hotel.rating ?? '';
      document.getElementById('startingPrice').value = hotel.startingPrice ?? '';
      document.getElementById('description').value = hotel.description || '';
      document.getElementById('active').checked = !!hotel.active;

      document.getElementById('hotelImage').value = hotel.imageUrl || '';
      if (imagePreview) imagePreview.src = hotel.imageUrl || noImageSVG;
      if (imagePreviewContainer) imagePreviewContainer.style.display = hotel.imageUrl ? 'block' : 'none';

      openModal();
    } catch (err) {
      console.error(err);
      alert('Error fetching hotel details.');
    }
  }

  function openModal() {
    console.log('Modal opening...');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    console.log('Modal classes:', modal.className);
  }

  function closeModal() {
    console.log('Modal closing...');
    // Remove focus before setting aria-hidden to avoid warning
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('[AdminHotels] ✅ handleFormSubmit fired');

    const ok = validateForm();
    console.log('[AdminHotels] validateForm:', ok);
    if (!ok) return;

    const imageUrl = document.getElementById('hotelImage').value.trim();

    const formData = {
      name: document.getElementById('name').value.trim(),
      address: document.getElementById('address').value.trim(),
      email: document.getElementById('email').value.trim() || null,
      phoneNumber: document.getElementById('phone').value.trim() || null,
      starRating: Number(document.getElementById('starRating').value),
      rating: Number(document.getElementById('rating').value),
      startingPrice: toNumberOrNull(document.getElementById('startingPrice').value),
      description: document.getElementById('description').value.trim() || null,
      active: document.getElementById('active').checked,
      imageUrl: imageUrl ? imageUrl : null,
    };

    console.log('[AdminHotels] About to send payload:', formData);

    try {
      if (isEditMode.active) {
        const updatedHotel = await hotelsApi.update(isEditMode.id, formData);
        console.log('Hotel updated successfully, response:', updatedHotel);

        // Update the local hotels array with the new data
        const index = hotels.findIndex(h => h.id === isEditMode.id);
        if (index !== -1 && updatedHotel) {
          hotels[index] = updatedHotel;
          console.log('Local hotels array updated');
        }
      } else {
        const newHotel = await hotelsApi.create(formData);
        console.log('Hotel created successfully, response:', newHotel);

        // Add new hotel to local array
        if (newHotel) {
          hotels.push(newHotel);
          console.log('New hotel added to local array');
        }
      }

      closeModal();

      // Small delay to ensure backend has committed the changes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Force reload from backend
      await loadHotels();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save hotel.');
    }
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    const name = document.getElementById('name');
    const star = document.getElementById('starRating');
    const rating = document.getElementById('rating');
    const address = document.getElementById('address');

    if (!name.value.trim()) {
      showError('name', 'Name is required');
      isValid = false;
    }
    if (!address.value.trim()) {
      showError('address', 'Address is required');
      isValid = false;
    }

    const starVal = Number(star.value);
    if (Number.isNaN(starVal) || starVal < 1 || starVal > 5) {
      showError('starRating', '1-5 Stars required');
      isValid = false;
    }

    const ratingVal = Number(rating.value);
    if (Number.isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
      showError('rating', '0-5 Rating required');
      isValid = false;
    }

    return isValid;
  }

  function showError(fieldId, msg) {
    const el = document.getElementById(`error-${fieldId}`);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach((el) => (el.textContent = ''));
  }

  function handleImagePreview(e) {
    const url = (e.target.value || '').trim();
    if (!imagePreview || !imagePreviewContainer) return;

    if (url) {
      imagePreview.src = url;
      imagePreview.onerror = () => (imagePreview.src = invalidURLSVG);
      imagePreviewContainer.style.display = 'block';
    } else {
      imagePreview.src = placeholderSVG;
      imagePreviewContainer.style.display = 'none';
    }
  }

  async function deleteHotel(id) {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    try {
      await hotelsApi.delete(id);
      console.log('Hotel deleted successfully');
      loadHotels();
    } catch (error) {
      console.error(error);
      alert('Deletion failed.');
    }
  }
})();