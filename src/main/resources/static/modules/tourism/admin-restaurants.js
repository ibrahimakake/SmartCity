/**
 * Admin Restaurants Page Logic
 * Handles Data Table rendering, CRUD operations, and Modal interactions.
 */

(function() {
  console.log('admin-restaurants.js loaded ✅');

  const restaurantsApi = window.restaurantsApi;

  if (!restaurantsApi) {
    console.error('[AdminRestaurants] window.restaurantsApi is missing.');
    return;
  }

  // --- State ---
  let restaurants = [];
  let currentPage = 1;
  const itemsPerPage = 5;
  let searchQuery = '';
  const isEditMode = { active: false, id: null };

  // --- DOM Elements ---
  const tableBody = document.getElementById('tableBody');
  const searchInput = document.getElementById('searchInput');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const form = document.getElementById('form');
  const addBtn = document.getElementById('addBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');

  const imageInput = document.getElementById('imageUrl');
  const imagePreview = document.getElementById('imagePreview');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');

  const required = [
    { el: tableBody, name: '#tableBody' },
    { el: modal, name: '#modal' },
    { el: form, name: '#form' },
    { el: addBtn, name: '#addBtn' },
  ];

  for (const r of required) {
    if (!r.el) {
      console.error(`Missing required element: ${r.name} ❌`);
      return;
    }
  }

  console.log('All required elements found ✅');

  const placeholderSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="14"%3EPreview%3C/text%3E%3C/svg%3E';

  const noImageSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

  const toNumberOrNull = (v) => {
    const s = String(v ?? '').trim();
    if (!s) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  // Initialize immediately
  setupEventListeners();
  loadRestaurants();

  async function loadRestaurants() {
    try {
      renderLoading();
      restaurants = await restaurantsApi.getAll();
      console.log('Restaurants loaded:', restaurants.length);
      renderTable();
    } catch (error) {
      console.error('Failed to load restaurants', error);
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>';
    }
  }

  function setupEventListeners() {
    console.log('[AdminRestaurants] Setting up event listeners...');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = (e.target.value || '').toLowerCase();
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
        const totalPages = Math.ceil(getFilteredRestaurants().length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
    }

    // Modal controls
    addBtn.addEventListener('click', () => {
      console.log('Add Restaurant button clicked!');
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

    form.addEventListener('submit', handleFormSubmit);

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
        await deleteRestaurant(id);
      }
    });

    console.log('[AdminRestaurants] Event listeners setup complete ✅');
  }

  function getFilteredRestaurants() {
    return restaurants.filter((restaurant) => {
      const name = (restaurant.name || '').toLowerCase();
      const cuisine = (restaurant.cuisineType || '').toLowerCase();

      return name.includes(searchQuery) || cuisine.includes(searchQuery);
    });
  }

  function renderTable() {
    const filtered = getFilteredRestaurants();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No restaurants found.</td></tr>';
      updatePagination(0, 0);
      return;
    }

    for (const restaurant of pageData) {
      const row = document.createElement('tr');

      row.innerHTML = `
        <td><img src="${restaurant.imageUrl || noImageSVG}" class="restaurant-thumb" alt="Thumb"></td>
        <td><strong>${restaurant.name || '-'}</strong></td>
        <td>${restaurant.cuisineType || '-'}</td>
        <td>${restaurant.priceRange || '-'}</td>
        <td>${restaurant.rating ?? '-'}</td>
        <td><small>${restaurant.contactNumber || 'N/A'}</small></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Edit" data-action="edit" data-id="${restaurant.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" title="Delete" data-action="delete" data-id="${restaurant.id}">
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
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Loading restaurants...</td></tr>';
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

    modalTitle.textContent = 'Add New Restaurant';
    form.reset();

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
    modalTitle.textContent = 'Edit Restaurant';
    clearErrors();

    try {
      const restaurant = await restaurantsApi.getById(id);
      if (!restaurant) return;

      document.getElementById('name').value = restaurant.name || '';
      document.getElementById('address').value = restaurant.address || '';
      document.getElementById('cuisineType').value = restaurant.cuisineType || '';
      document.getElementById('contactNumber').value = restaurant.contactNumber || '';
      document.getElementById('priceRange').value = restaurant.priceRange || '$';
      document.getElementById('rating').value = restaurant.rating ?? '';
      document.getElementById('openingHours').value = restaurant.openingHours || '';
      document.getElementById('description').value = restaurant.description || '';

      document.getElementById('imageUrl').value = restaurant.imageUrl || '';
      if (imagePreview) imagePreview.src = restaurant.imageUrl || noImageSVG;
      if (imagePreviewContainer) imagePreviewContainer.style.display = restaurant.imageUrl ? 'block' : 'none';

      openModal();
    } catch (err) {
      console.error(err);
      alert('Error fetching restaurant details.');
    }
  }

  function openModal() {
    console.log('Modal opening...');
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
  }

  function closeModal() {
    console.log('Modal closing...');
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('[AdminRestaurants] ✅ handleFormSubmit fired');

    const ok = validateForm();
    console.log('[AdminRestaurants] validateForm:', ok);
    if (!ok) return;

    const imageUrl = document.getElementById('imageUrl').value.trim();

    const formData = {
      name: document.getElementById('name').value.trim(),
      address: document.getElementById('address').value.trim(),
      cuisineType: document.getElementById('cuisineType').value.trim() || null,
      contactNumber: document.getElementById('contactNumber').value.trim(),
      priceRange: document.getElementById('priceRange').value,
      starRating: 3,
      rating: Number(document.getElementById('rating').value) || 3.0,
      openingHours: document.getElementById('openingHours').value.trim() || null,
      description: document.getElementById('description').value.trim() || null,
      imageUrl: imageUrl || null,
    };

    console.log('[AdminRestaurants] About to send payload:', formData);

    try {
      if (isEditMode.active) {
        const updatedRestaurant = await restaurantsApi.update(isEditMode.id, formData);
        console.log('Restaurant updated successfully, response:', updatedRestaurant);

        const index = restaurants.findIndex(r => r.id === isEditMode.id);
        if (index !== -1 && updatedRestaurant) {
          restaurants[index] = updatedRestaurant;
          console.log('Local restaurants array updated');
        }
      } else {
        const newRestaurant = await restaurantsApi.create(formData);
        console.log('Restaurant created successfully, response:', newRestaurant);

        if (newRestaurant) {
          restaurants.push(newRestaurant);
          console.log('New restaurant added to local array');
        }
      }

      closeModal();

      await new Promise(resolve => setTimeout(resolve, 100));
      await loadRestaurants();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save restaurant.');
    }
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    const name = document.getElementById('name');
    const address = document.getElementById('address');
    const contactNumber = document.getElementById('contactNumber');
    const rating = document.getElementById('rating');

    if (!name.value.trim()) {
      showError('name', 'Name is required');
      isValid = false;
    }

    if (!address.value.trim()) {
      showError('address', 'Address is required');
      isValid = false;
    }

    if (!contactNumber.value.trim()) {
      showError('contactNumber', 'Contact number is required');
      isValid = false;
    }

    const ratingVal = Number(rating.value);
    if (rating.value && (Number.isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5)) {
      showError('rating', '0-5 Rating required');
      isValid = false;
    }

    return isValid;
  }

  function showError(fieldId, msg) {
    const el = document.getElementById('error-' + fieldId);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg, .error-message').forEach((el) => (el.textContent = ''));
  }

  function handleImagePreview(e) {
    const url = (e.target.value || '').trim();
    if (!imagePreview || !imagePreviewContainer) return;

    if (url) {
      imagePreview.src = url;
      imagePreview.onerror = () => (imagePreview.src = placeholderSVG);
      imagePreviewContainer.style.display = 'block';
    } else {
      imagePreview.src = placeholderSVG;
      imagePreviewContainer.style.display = 'none';
    }
  }

  async function deleteRestaurant(id) {
    if (!confirm('Are you sure you want to delete this restaurant?')) return;
    try {
      await restaurantsApi.delete(id);
      console.log('Restaurant deleted successfully');
      loadRestaurants();
    } catch (error) {
      console.error(error);
      alert('Deletion failed.');
    }
  }
})();