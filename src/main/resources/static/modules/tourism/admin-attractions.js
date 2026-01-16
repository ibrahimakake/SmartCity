/**
 * Admin Attractions Page Logic
 */

(function() {
  console.log('admin-attractions.js loaded ✅');

  const attractionsApi = window.attractionsApi;

  if (!attractionsApi) {
    console.error('[AdminAttractions] window.attractionsApi is missing.');
    return;
  }

  // --- State ---
  let attractions = [];
  let currentPage = 1;
  const itemsPerPage = 5;
  let searchQuery = '';
  const isEditMode = { active: false, id: null };

  // --- DOM Elements ---
  const tableBody = document.getElementById('attractionsTableBody');
  const searchInput = document.getElementById('searchInput');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  const modal = document.getElementById('attractionModal');
  const modalTitle = document.getElementById('modalTitle');
  const attractionForm = document.getElementById('attractionForm');
  const addBtn = document.getElementById('addAttractionBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');

  const required = [
    { el: tableBody, name: '#attractionsTableBody' },
    { el: modal, name: '#attractionModal' },
    { el: attractionForm, name: '#attractionForm' },
    { el: addBtn, name: '#addAttractionBtn' },
  ];

  for (const r of required) {
    if (!r.el) {
      console.error(`Missing required element: ${r.name} ❌`);
      return;
    }
  }

  console.log('All required elements found ✅');

  const noImageSVG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="150" height="150"%3E%3Crect width="150" height="150" fill="%23e0e0e0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-family="Arial" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Initialize
  setupEventListeners();
  loadAttractions();

  async function loadAttractions() {
    try {
      renderLoading();
      attractions = await attractionsApi.getAll();
      console.log('Attractions loaded:', attractions.length);
      renderTable();
    } catch (error) {
      console.error('Failed to load attractions', error);
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
  }

  function setupEventListeners() {
    console.log('[AdminAttractions] Setting up event listeners...');

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
        const totalPages = Math.ceil(getFilteredAttractions().length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
    }

    addBtn.addEventListener('click', () => {
      console.log('Add Attraction button clicked!');
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

    attractionForm.addEventListener('submit', handleFormSubmit);

    tableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit"]');
      const delBtn = e.target.closest('[data-action="delete"]');

      if (editBtn) {
        await openEditModal(editBtn.dataset.id);
      } else if (delBtn) {
        await deleteAttraction(delBtn.dataset.id);
      }
    });

    console.log('[AdminAttractions] Event listeners setup complete ✅');
  }

  function getFilteredAttractions() {
    return attractions.filter((attraction) => {
      const name = (attraction.name || '').toLowerCase();
      const category = (attraction.category || '').toLowerCase();
      const address = (attraction.address || '').toLowerCase();
      const contact = (attraction.contactNumber || '').toLowerCase();

      return name.includes(searchQuery) || category.includes(searchQuery) ||
             address.includes(searchQuery) || contact.includes(searchQuery);
    });
  }

  function renderTable() {
    const filtered = getFilteredAttractions();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="text-center">No attractions found.</td></tr>`;
      updatePagination(0, 0);
      return;
    }

    for (const attraction of pageData) {
      const row = document.createElement('tr');

      const imageUrl = attraction.imageUrl || noImageSVG;
      const price = attraction.ticketPrice != null && attraction.ticketPrice !== '' ? `${attraction.ticketPrice} DH` : 'Free';

      row.innerHTML = `
        <td><img src="${imageUrl}" class="hotel-thumb" alt="${attraction.name}" /></td>
        <td><strong>${attraction.name || '-'}</strong></td>
        <td>${attraction.category || '-'}</td>
        <td>${attraction.address || '-'}</td>
        <td>${attraction.contactNumber || '-'}</td>
        <td>${price}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Edit" data-action="edit" data-id="${attraction.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" title="Delete" data-action="delete" data-id="${attraction.id}">
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
    tableBody.innerHTML = `<tr><td colspan="7" class="text-center">Loading attractions...</td></tr>`;
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

    modalTitle.textContent = 'Add New Attraction';
    attractionForm.reset();
    document.getElementById('ticketPrice').value = '0';

    clearErrors();
    openModal();
  }

  async function openEditModal(id) {
    console.log('Opening Edit Modal for ID:', id);
    isEditMode.active = true;
    isEditMode.id = id;
    modalTitle.textContent = 'Edit Attraction';
    clearErrors();

    try {
      const attraction = await attractionsApi.getById(id);
      if (!attraction) return;

      document.getElementById('name').value = attraction.name || '';
      document.getElementById('category').value = attraction.category || '';
      document.getElementById('ticketPrice').value = attraction.ticketPrice ?? '0';
      document.getElementById('address').value = attraction.address || '';
      document.getElementById('contactNumber').value = attraction.contactNumber || '';
      document.getElementById('description').value = attraction.description || '';
      document.getElementById('imageUrl').value = attraction.imageUrl || '';

      openModal();
    } catch (err) {
      console.error(err);
      alert('Error fetching attraction details.');
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
    console.log('[AdminAttractions] ✅ handleFormSubmit fired');

    if (!validateForm()) return;

    const formData = {
      name: document.getElementById('name').value.trim(),
      category: document.getElementById('category').value.trim(),
      ticketPrice: parseFloat(document.getElementById('ticketPrice').value) || 0,
      address: document.getElementById('address').value.trim(),
      contactNumber: document.getElementById('contactNumber').value.trim(),
      description: document.getElementById('description').value.trim(),
      imageUrl: document.getElementById('imageUrl').value.trim() || null,
    };

    console.log('[AdminAttractions] Payload:', JSON.stringify(formData, null, 2));

    try {
      if (isEditMode.active) {
        const updated = await attractionsApi.update(isEditMode.id, formData);
        console.log('Attraction updated:', updated);
        const index = attractions.findIndex(a => a.id === isEditMode.id);
        if (index !== -1 && updated) attractions[index] = updated;
      } else {
        const created = await attractionsApi.create(formData);
        console.log('Attraction created:', created);
        if (created) attractions.push(created);
      }

      closeModal();
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadAttractions();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save attraction.');
    }
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    const name = document.getElementById('name');
    const category = document.getElementById('category');
    const ticketPrice = document.getElementById('ticketPrice');
    const address = document.getElementById('address');
    const contactNumber = document.getElementById('contactNumber');
    const description = document.getElementById('description');

    if (!name.value.trim()) {
      showError('name', 'Name is required');
      isValid = false;
    }

    if (!category.value.trim()) {
      showError('category', 'Category is required');
      isValid = false;
    }

    const priceVal = parseFloat(ticketPrice.value);
    if (isNaN(priceVal) || priceVal < 0) {
      showError('ticketPrice', 'Valid ticket price is required');
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

  async function deleteAttraction(id) {
    if (!confirm('Are you sure you want to delete this attraction?')) return;
    try {
      await attractionsApi.delete(id);
      console.log('Attraction deleted');
      loadAttractions();
    } catch (error) {
      console.error(error);
      alert('Deletion failed.');
    }
  }
})();