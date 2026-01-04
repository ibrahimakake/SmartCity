/**
 * Business News User Page Logic
 */

let newsArticles = [];

document.addEventListener('DOMContentLoaded', async () => {
    await initBusinessNews();
});

async function initBusinessNews() {
    try {
        newsArticles = await businessNewsApi.getAll();
        renderNews(newsArticles);
    } catch (e) {
        console.error('Failed to load business news', e);
        document.getElementById('news-list').innerHTML = '<p class="text-center text-danger">Failed to load business news.</p>';
    }
    setupEventListeners();
}

function renderNews(data) {
    const list = document.getElementById('news-list');
    list.innerHTML = '';

    if (!data || data.length === 0) {
        list.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">No news found matching your criteria.</p>';
        return;
    }

    data.filter(n => n.active).forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';
        // Content might be long, so summary is useful. Backend might return full content.
        // Assuming backend has: title, industry, summary, content, imageUrl, date, author, active.
        const img = article.imageUrl || 'https://via.placeholder.com/300x200?text=News';
        const dateStr = article.date ? new Date(article.date).toLocaleDateString() : 'Recent';

        card.innerHTML = `
            <img src="${img}" alt="${article.title}" style="width:100%; height: 200px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/300x200'">
            <div style="margin-top: 15px;">
                <div style="margin-bottom: 10px; display:flex; justify-content:space-between; align-items:center;">
                    <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${article.industry || 'General'}</span>
                     <span style="font-size:0.8rem; color:var(--text-muted);">${dateStr}</span>
                </div>
                <h3 style="margin:0; font-size: 1.2rem;">${article.title}</h3>
                <p style="color:var(--text-muted); font-size: 0.9rem; margin: 10px 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                    ${article.summary || article.content.substring(0, 100) + '...'}
                </p>
                <div class="card-action" style="margin-top: auto;">
                    <button class="btn btn-secondary btn-sm" onclick="showDetails('${article.id}')" style="width:100%;">Read More</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const industryFilter = document.getElementById('industryFilter');
    const filterBtn = document.getElementById('filterBtn');

    const detailsModal = document.getElementById('detailsModal');
    const closeModal = document.getElementById('closeModal');

    const applyFilters = () => {
        const term = searchInput.value.toLowerCase();
        const industry = industryFilter ? industryFilter.value : 'All';

        const filtered = newsArticles.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(term) || (n.summary && n.summary.toLowerCase().includes(term));
            const matchesIndustry = industry === 'All' || (n.industry && n.industry === industry);
            return matchesSearch && matchesIndustry;
        });

        renderNews(filtered);
    };

    if (filterBtn) filterBtn.addEventListener('click', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (industryFilter) industryFilter.addEventListener('change', applyFilters);

    const closeAllModals = () => {
        detailsModal.style.display = 'none';
    };

    if (closeModal) closeModal.onclick = closeAllModals;
    window.onclick = (e) => {
        if (e.target == detailsModal) closeAllModals();
    };
}

window.showDetails = async (id) => {
    try {
        const article = await businessNewsApi.getById(id);
        if (!article) return;

        const modalBody = document.getElementById('modalBody');
        const img = article.imageUrl || 'https://via.placeholder.com/300x200';
        const dateStr = article.date ? new Date(article.date).toLocaleDateString() : 'Recent';

        modalBody.innerHTML = `
            <img src="${img}" style="width:100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: var(--primary-color); font-size: 2rem;">${article.title}</h1>
            <div style="display:flex; justify-content:space-between; margin: 10px 0; color:var(--text-muted); font-size:0.9rem;">
                <span>By ${article.author || 'Unknown'} | ${dateStr}</span>
                <span class="badge" style="background:rgba(255,255,255,0.1); color:var(--primary-color);">${article.industry || 'General'}</span>
            </div>
            <hr style="border-color: rgba(255,255,255,0.1); margin: 20px 0;">
            <div style="line-height: 1.8; font-size: 1.05rem;">
                ${article.content || ''}
            </div>
        `;

        document.getElementById('detailsModal').style.display = 'flex';
    } catch (e) {
        console.error(e);
        alert('Failed to load news');
    }
};
