// Job Module Logic

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.href.includes('industries.html')) loadData('industries');
    if (window.location.href.includes('companies.html')) loadData('companies');
    if (window.location.href.includes('job-listings.html')) loadData('job-listings');

    window.addEntity = function () { alert('Add Entity (Mock)'); }
});

async function loadData(type) {
    const list = document.getElementById('entity-list');
    if (!list) return;

    const data = await api.get(type);
    const role = localStorage.getItem('role');
    const isAdmin = role === 'ADMIN';

    list.innerHTML = '';
    data.forEach(item => {
        const div = document.createElement('div');
        div.className = 'card job-card';
        div.innerHTML = `
            <div>
                <h3>${item.name || item.title}</h3>
                <p>${item.industry || item.company || ''}</p>
            </div>
            <div>
                 ${isAdmin ? '<button class="btn btn-primary">Edit</button>' : '<button class="btn btn-primary">Apply</button>'}
            </div>
        `;
        list.appendChild(div);
    });
}
