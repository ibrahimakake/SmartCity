/**
 * Admin ATMs Page Logic
 */

(function() {
  console.log('admin-atms.js loaded ✅');

  const atmsApi = window.atmsApi;

  if (!atmsApi) {
    console.error('[AdminATMs] window.atmsApi is missing.');
    return;
  }

  // --- State ---
  let atms = [];
  let currentPage = 1;
  const itemsPerPage = 5;
  let currentFilter = 'all';
  let searchQuery = '';
  const isEditMode = { active: false, id: null };

  // --- DOM Elements ---
  const tableBody = document.getElementById('atmsTableBody');
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');
  const prevBtn = document.getElementById('prevPage');
  const nextBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');

  const modal = document.getElementById('atmModal');
  const modalTitle = document.getElementById('modalTitle');
  const atmForm = document.getElementById('atmForm');
  const addBtn = document.getElementById('addAtmBtn');
  const closeBtn = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');

  const required = [
    { el: tableBody, name: '#atmsTableBody' },
    { el: modal, name: '#atmModal' },
    { el: atmForm, name: '#atmForm' },
    { el: addBtn, name: '#addAtmBtn' },
  ];

  for (const r of required) {
    if (!r.el) {
      console.error(`Missing required element: ${r.name} ❌`);
      return;
    }
  }

  console.log('All required elements found ✅');

  // Initialize
  setupEventListeners();
  loadATMs();

  async function loadATMs() {
    try {
      renderLoading();
      atms = await atmsApi.getAll();
      console.log('ATMs loaded:', atms.length);
      renderTable();
    } catch (error) {
      console.error('Failed to load ATMs', error);
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load data.</td></tr>`;
    }
  }

  function setupEventListeners() {
    console.log('[AdminATMs] Setting up event listeners...');

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
        const totalPages = Math.ceil(getFilteredATMs().length / itemsPerPage) || 1;
        if (currentPage < totalPages) {
          currentPage++;
          renderTable();
        }
      });
    }

    addBtn.addEventListener('click', () => {
      console.log('Add ATM button clicked!');
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

    atmForm.addEventListener('submit', handleFormSubmit);

    tableBody.addEventListener('click', async (e) => {
      const editBtn = e.target.closest('[data-action="edit"]');
      const delBtn = e.target.closest('[data-action="delete"]');

      if (editBtn) {
        await openEditModal(editBtn.dataset.id);
      } else if (delBtn) {
        await deleteATM(delBtn.dataset.id);
      }
    });

    console.log('[AdminATMs] Event listeners setup complete ✅');
  }

  function getFilteredATMs() {
    return atms.filter((atm) => {
      const name = (atm.name || '').toLowerCase();
      const bankName = (atm.bankName || '').toLowerCase();
      const address = (atm.address || '').toLowerCase();

      const matchesSearch = name.includes(searchQuery) || bankName.includes(searchQuery) || address.includes(searchQuery);
      const matchesFilter =
        currentFilter === 'all' ||
        (currentFilter === 'active' && !!atm.active) ||
        (currentFilter === 'inactive' && !atm.active);

      return matchesSearch && matchesFilter;
    });
  }

  function renderTable() {
    const filtered = getFilteredATMs();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filtered.slice(start, end);
    const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;

    tableBody.innerHTML = '';

    if (pageData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center">No ATMs found.</td></tr>`;
      updatePagination(0, 0);
      return;
    }

    for (const atm of pageData) {
      const row = document.createElement('tr');

      const statusClass = atm.active ? 'status-active' : 'status-inactive';
      const statusText = atm.active ? 'Active' : 'Inactive';

      row.innerHTML = `
        <td><strong>${atm.name || '-'}</strong></td>
        <td>${atm.bankName || '-'}</td>
        <td>${atm.address || '-'}</td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon btn-edit" title="Edit" data-action="edit" data-id="${atm.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn-icon btn-delete" title="Delete" data-action="delete" data-id="${atm.id}">
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
    tableBody.innerHTML = `<tr><td colspan="5" class="text-center">Loading ATMs...</td></tr>`;
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

    modalTitle.textContent = 'Add New ATM';
    atmForm.reset();

    clearErrors();
    openModal();
  }

  async function openEditModal(id) {
    console.log('Opening Edit Modal for ID:', id);
    isEditMode.active = true;
    isEditMode.id = id;
    modalTitle.textContent = 'Edit ATM';
    clearErrors();

    try {
      const atm = await atmsApi.getById(id);
      if (!atm) return;

      document.getElementById('name').value = atm.name || '';
      document.getElementById('bankName').value = atm.bankName || '';
      document.getElementById('address').value = atm.address || '';
      document.getElementById('description').value = atm.description || '';
      document.getElementById('active').checked = !!atm.active;

      openModal();
    } catch (err) {
      console.error(err);
      alert('Error fetching ATM details.');
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
    console.log('[AdminATMs] ✅ handleFormSubmit fired');

    if (!validateForm()) return;

    const formData = {
      name: document.getElementById('name').value.trim(),
      bankName: document.getElementById('bankName').value.trim(),
      address: document.getElementById('address').value.trim(),
      description: document.getElementById('description').value.trim() || null,
      active: document.getElementById('active').checked,
    };

    console.log('[AdminATMs] Payload:', JSON.stringify(formData, null, 2));

    try {
      if (isEditMode.active) {
        const updated = await atmsApi.update(isEditMode.id, formData);
        console.log('ATM updated:', updated);
        const index = atms.findIndex(a => a.id === isEditMode.id);
        if (index !== -1 && updated) atms[index] = updated;
      } else {
        const created = await atmsApi.create(formData);
        console.log('ATM created:', created);
        if (created) atms.push(created);
      }

      closeModal();
      await new Promise(resolve => setTimeout(resolve, 100));
      await loadATMs();
    } catch (error) {
      console.error('Save failed', error);
      alert('Failed to save ATM.');
    }
  }

  function validateForm() {
    let isValid = true;
    clearErrors();

    const name = document.getElementById('name');
    const bankName = document.getElementById('bankName');
    const address = document.getElementById('address');

    if (!name.value.trim()) {
      showError('name', 'ATM name is required');
      isValid = false;
    }

    if (!bankName.value.trim()) {
      showError('bankName', 'Bank name is required');
      isValid = false;
    }

    if (!address.value.trim()) {
      showError('address', 'Address is required');
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

  async function deleteATM(id) {
    if (!confirm('Are you sure you want to delete this ATM?')) return;
    try {
      await atmsApi.delete(id);
      console.log('ATM deleted');
      loadATMs();
    } catch (error) {
      console.error(error);
      alert('Deletion failed.');
    }
  }
})();