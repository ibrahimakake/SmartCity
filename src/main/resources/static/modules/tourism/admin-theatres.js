/**
 * Admin Theatres Page Logic
 * Handles Data Table rendering, CRUD operations, and Modal interactions.
 */

(function () {
  console.log('admin-theatres.js loaded ✅');

  const theatresApi = window.theatresApi;

  if (!theatresApi) {
    console.error(
      '[AdminTheatres] window.theatresApi is missing. Check load order: api.js -> theatresApi.js -> admin-theatres.js'
    );
    return;
  }

  // --- State ---
  let theatres = [];
  let currentPage = 1;
  const itemsPerPage = 5;
  let searchQuery = '';
  const isEditMode = { active: false, id: null };

  // --- DOM Elements ---
  const tableBody = document.getElementById('theatresTableBody');
  const searchInput = document.getElementById('searchInput');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  const modal = document.getElementById('theatreModal');
  const modalTitle = document.getElementById('modalTitle');
  const theatreForm = document.getElementById('theatreForm');
  const addBtn = document.getElementById('addTheatreBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');

  const required = [
    { el: tableBody, name: '#theatresTableBody' },
    { el: modal, name: '#theatreModal' },
    { el: theatreForm, name: '#theatreForm' },
    { el: addBtn, name: '#addTheatreBtn' },
  ];

  for (const r of required) {
    if (!r.el) {
      console.error(`Missing required element: ${r.name} ❌`);
      return;
    }
  }

  console.log('All required elements found ✅');

  // Initialize immediately
  setupEventListeners();
  loadTheatres();

  async function loadTheatres() {
    try {
      renderLoading();
      theatres = await theatresApi.getAll();
      console.log('Theatres loaded:', theatres.length);
      renderTable();
    } catch (error) {
      console.error('Failed to load theatres', error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
  }

  function setupEventListeners() {
    console.log('[AdminTheatres] Setting up event listeners...');

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
        const totalPages = Math.ceil(getFilteredTheatres().length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
    }

    // Modal controls
    addBtn.addEventListener('click', () => {
      console.log('Add Theatre button clicked!');
      openAddModal();
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) closeModal();
    });

    theatreForm.addEventListener('submit', handleFormSubmit);

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
        await deleteTheatre(id);
      }
    });

    console.log('[AdminTheatres] Event listeners setup complete ✅');
  }

  function getFilteredTheatres() {
    return theatres.filter((theatre) => {
      const name = (theatre.name || '').toLowerCase();
      const address = (theatre.address || '').toLowerCase();
      const contact = (theatre.contactNumber || '').toLowerCase();
      return name.includes(searchQuery) || address.includes(searchQuery) || contact.includes(searchQuery);
    });
  }

  // ✅ UPDATED renderTable() (with image + colspan 6)
  function renderTable() {
    const filtered = getFilteredTheatres();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    const noImageSVG =
      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No theatres found.</td></tr>`;
      updatePagination(0, 0);
      return;
    }

    for (const theatre of pageData) {
      const row = document.createElement('tr');

      const rating = theatre.rating ? `⭐ ${theatre.rating}` : 'N/A';
      const imageUrl = theatre.imageUrl || noImageSVG;

      row.innerHTML = `
        <td><img src="${imageUrl}" class="hotel-thumb" alt="${theatre.name}" /></td>
        <td><strong>${theatre.name || '-'}</strong></td>
        <td>${theatre.address || '-'}</td>
        <td>${theatre.contactNumber || '-'}</td>
        <td>${rating}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Edit" data-action="edit" data-id="${theatre.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" title="Delete" data-action="delete" data-id="${theatre.id}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      `;

      tableBody.appendChild(row);
    }

    updatePagination(currentPage, totalPages);
  }

  // ✅ UPDATED renderLoading() (colspan 6)
  function renderLoading() {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Loading theatres...</td></tr>`;
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

    modalTitle.textContent = 'Add New Theatre';
    theatreForm.reset();

    // Set default rating
    const ratingEl = document.getElementById('rating');
    if (ratingEl) ratingEl.value = '0.0';

    clearErrors();
    openModal();
  }

  async function openEditModal(id) {
    console.log('Opening Edit Modal for ID:', id);
    isEditMode.active = true;
    isEditMode.id = id;
    modalTitle.textContent = 'Edit Theatre';
    clearErrors();

    try {
      const theatre = await theatresApi.getById(id);
      if (!theatre) return;

      document.getElementById('name').value = theatre.name || '';
      document.getElementById('address').value = theatre.address || '';
      document.getElementById('contactNumber').value = theatre.contactNumber || '';
      document.getElementById('rating').value = theatre.rating || '0.0';
      document.getElementById('description').value = theatre.description || '';
      document.getElementById('imageUrl').value = theatre.imageUrl || '';

      openModal();
    } catch (err) {
      console.error(err);
      alert('Error fetching theatre details.');
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
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('[AdminTheatres] ✅ handleFormSubmit fired');

    const ok = validateForm();
    console.log('[AdminTheatres] validateForm:', ok);
    if (!ok) return;

    const formData = {
      name: document.getElementById('name').value.trim(),
      address: document.getElementById('address').value.trim(),
      contactNumber: document.getElementById('contactNumber').value.trim(),
      rating: parseFloat(document.getElementById('rating').value) || 0.0,
      description: document.getElementById('description').value.trim(),
      imageUrl: document.getElementById('imageUrl').value.trim() || null,
    };

    console.log('[AdminTheatres] About to send payload:', JSON.stringify(formData, null, 2));

    try {
      if (isEditMode.active) {
        const updated = await theatresApi.update(isEditMode.id, formData);
        console.log('Theatre updated successfully, response:', updated);

        const index = theatres.findIndex((t) => t.id === isEditMode.id);
        if (index !== -1 && updated) {
          theatres[index] = updated;
          console.log('Local theatres array updated');
        }
      } else {
        const created = await theatresApi.create(formData);
        console.log('Theatre created successfully, response:', created);

        if (created) {
          theatres.push(created);
          console.log('New theatre added to local array');
        }
      }

      closeModal();

      await new Promise((resolve) => setTimeout(resolve, 100));
      await loadTheatres();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save theatre. Please check all required fields.');
    }
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    const name = document.getElementById('name');
    const address = document.getElementById('address');
    const contactNumber = document.getElementById('contactNumber');
    const rating = document.getElementById('rating');
    const description = document.getElementById('description');

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

    const ratingVal = parseFloat(rating.value);
    if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 5) {
      showError('rating', 'Rating must be between 0 and 5');
      isValid = false;
    }

    if (!description.value.trim()) {
      showError('description', 'Description is required');
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

  async function deleteTheatre(id) {
    if (!confirm('Are you sure you want to delete this theatre?')) return;
    try {
      await theatresApi.delete(id);
      console.log('Theatre deleted successfully');
      loadTheatres();
    } catch (error) {
      console.error(error);
      alert('Deletion failed.');
    }
  }
})();
