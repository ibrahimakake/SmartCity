// Student Module Logic

document.addEventListener('DOMContentLoaded', () => {
    const isUniversities = window.location.href.includes('universities.html');
    const isColleges = window.location.href.includes('colleges.html');
    const isLibraries = window.location.href.includes('libraries.html');
    const isCoaching = window.location.href.includes('coaching-centers.html');

    if (isUniversities) loadData('universities');
    if (isColleges) loadData('colleges');
    if (isLibraries) loadData('libraries');
    if (isCoaching) loadData('coaching');

    window.addEntity = function () {
        alert('Add Entity (Mock)');
    }
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
        div.className = 'card edu-card';

        let actions = '';
        if (isAdmin) {
            actions = `<button class="btn btn-primary">Edit</button> <button class="btn btn-danger">Delete</button>`;
        } else {
            actions = `<button class="btn btn-secondary">View Details</button>`;
        }

        div.innerHTML = `
            <div>
                <h3>${item.name || item.title}</h3>
                <p>${item.type || item.address || ''}</p>
            </div>
            <div>${actions}</div>
        `;
        list.appendChild(div);
    });
}
