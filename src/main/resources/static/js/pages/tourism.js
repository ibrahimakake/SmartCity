import { isAuthenticated, getUser } from '../../js/storage.js';
import { tourismApi } from '../../js/api.js';

// DOM Elements
const mapElement = document.getElementById('map');
const listingsContainer = document.getElementById('listings-container');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const viewButtons = document.querySelectorAll('.view-btn');
const applyFiltersBtn = document.getElementById('apply-filters');
const resetFiltersBtn = document.getElementById('reset-filters');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const modal = document.getElementById('place-modal');
const closeModal = document.querySelector('.close-modal');
const placeDetails = document.getElementById('place-details');

// State
let map;
let markers = [];
let currentPage = 1;
const itemsPerPage = 9;
let currentView = 'grid'; // 'grid' or 'list'
let currentFilters = {
    categories: ['attraction', 'hotel', 'restaurant'],
    priceRange: 4,
    minRating: 3,
    searchQuery: ''
};

// Sample data (replace with API calls in production)
const samplePlaces = [
    {
        id: 1,
        name: 'Historic Downtown',
        type: 'attraction',
        description: 'Explore the historic heart of the city with beautiful architecture and rich history.',
        image: 'https://source.unsplash.com/random/600x400?historic',
        price: 2,
        rating: 4.7,
        reviewCount: 128,
        location: '123 Main St, City Center',
        coordinates: [33.5731, -7.5898],
        tags: ['landmark', 'history', 'walking tour']
    },
    {
        id: 2,
        name: 'Luxury Bay Hotel',
        type: 'hotel',
        description: '5-star luxury hotel with stunning ocean views and world-class amenities.',
        image: 'https://source.unsplash.com/random/600x400?hotel',
        price: 4,
        rating: 4.9,
        reviewCount: 245,
        location: '456 Ocean Blvd, Beachfront',
        coordinates: [33.5750, -7.5950],
        tags: ['luxury', 'spa', 'pool', 'restaurant']
    },
    {
        id: 3,
        name: 'Seaside Bistro',
        type: 'restaurant',
        description: 'Fresh seafood and Mediterranean cuisine with a beautiful seaside view.',
        image: 'https://source.unsplash.com/random/600x400?restaurant',
        price: 3,
        rating: 4.5,
        reviewCount: 187,
        location: '789 Harbor Walk, Marina',
        coordinates: [33.5710, -7.5870],
        tags: ['seafood', 'romantic', 'waterfront']
    },
    // Add more sample places...
];

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return;
    }

    initMap();
    loadPlaces();
    setupEventListeners();
});

// Initialize the map
function initMap() {
    if (!mapElement) return;

    // Default to Casablanca coordinates
    const defaultCoords = [33.5731, -7.5898];
    
    map = L.map('map').setView(defaultCoords, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

// Load places (in a real app, this would be an API call)
function loadPlaces() {
    // Show loading state
    listingsContainer.innerHTML = `
        <div class="loading-spinner">
            <div class="spinner"></div>
            <p>Loading places...</p>
        </div>
    `;

    // Simulate API call
    setTimeout(() => {
        const filteredPlaces = filterPlaces(samplePlaces, currentFilters);
        displayPlaces(filteredPlaces);
        updateMapMarkers(filteredPlaces);
    }, 800);
}

// Filter places based on current filters
function filterPlaces(places, filters) {
    return places.filter(place => {
        // Filter by category
        if (!filters.categories.includes(place.type)) {
            return false;
        }
        
        // Filter by price range
        if (place.price > filters.priceRange) {
            return false;
        }
        
        // Filter by rating
        if (place.rating < filters.minRating) {
            return false;
        }
        
        // Filter by search query
        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            const matchesName = place.name.toLowerCase().includes(query);
            const matchesDescription = place.description.toLowerCase().includes(query);
            const matchesTags = place.tags.some(tag => tag.toLowerCase().includes(query));
            
            if (!(matchesName || matchesDescription || matchesTags)) {
                return false;
            }
        }
        
        return true;
    });
}

// Display places in the listings grid
function displayPlaces(places) {
    if (places.length === 0) {
        listingsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No places found</h3>
                <p>Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    // Pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedPlaces = places.slice(startIndex, startIndex + itemsPerPage);
    
    // Update pagination controls
    const totalPages = Math.ceil(places.length / itemsPerPage);
    updatePaginationControls(totalPages);
    
    // Generate HTML for places
    const placesHTML = paginatedPlaces.map(place => createPlaceCard(place)).join('');
    
    // Update the view
    listingsContainer.className = `listings-grid ${currentView}-view`;
    listingsContainer.innerHTML = placesHTML;
    
    // Add event listeners to place cards
    document.querySelectorAll('.listing-card').forEach(card => {
        card.addEventListener('click', () => showPlaceDetails(parseInt(card.dataset.id)));
    });
}

// Create HTML for a place card
function createPlaceCard(place) {
    const priceSymbols = '$'.repeat(place.price);
    const emptyPriceSymbols = '•'.repeat(4 - place.price);
    
    return `
        <div class="listing-card" data-id="${place.id}">
            <img src="${place.image}" alt="${place.name}" class="listing-image">
            <div class="listing-details">
                <div class="listing-header">
                    <h3 class="listing-title">${place.name}</h3>
                    <span class="listing-price">${priceSymbols}<span style="color: #ddd;">${emptyPriceSymbols}</span></span>
                </div>
                <span class="listing-category">${formatCategory(place.type)}</span>
                <div class="listing-rating">
                    <div class="stars">
                        ${generateStarRating(place.rating)}
                    </div>
                    <span class="rating-count">${place.rating.toFixed(1)} (${place.reviewCount})</span>
                </div>
                <div class="listing-location">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${place.location}</span>
                </div>
                <p class="listing-description">${place.description}</p>
                <button class="btn btn-outline btn-block" style="margin-top: 0.75rem;">View Details</button>
            </div>
        </div>
    `;
}

// Update map markers
function updateMapMarkers(places) {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Add new markers
    places.forEach(place => {
        const marker = L.marker(place.coordinates)
            .addTo(map)
            .bindPopup(`<b>${place.name}</b><br>${place.type}`);
        
        markers.push(marker);
    });
    
    // Fit map to bounds if there are markers
    if (markers.length > 0) {
        const group = new L.featureGroup(markers);
        map.fitBounds(group.getBounds().pad(0.1));
    }
}

// Show place details in modal
function showPlaceDetails(placeId) {
    const place = samplePlaces.find(p => p.id === placeId);
    if (!place) return;
    
    const priceSymbols = '$'.repeat(place.price);
    const emptyPriceSymbols = '•'.repeat(4 - place.price);
    
    placeDetails.innerHTML = `
        <div class="place-details">
            <div class="place-gallery">
                <img src="${place.image}" alt="${place.name}" class="place-main-image">
                <div class="place-thumbnails">
                    ${[1, 2, 3].map(i => `
                        <img src="${place.image}?v=${i}" alt="${place.name} ${i}" class="thumbnail">
                    `).join('')}
                </div>
            </div>
            <div class="place-info">
                <h2>${place.name}</h2>
                <div class="place-meta">
                    <div class="place-rating">
                        <span class="stars">${generateStarRating(place.rating, true)}</span>
                        <span>${place.rating.toFixed(1)} (${place.reviewCount} reviews)</span>
                    </div>
                    <div class="place-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${place.location}</span>
                    </div>
                    <div class="place-price">
                        <span>Price: </span>
                        <span class="price-value">${priceSymbols}<span style="color: #ddd;">${emptyPriceSymbols}</span></span>
                    </div>
                </div>
                <div class="place-description">
                    <h3>About</h3>
                    <p>${place.description}</p>
                </div>
                <div class="place-tags">
                    ${place.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="place-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-calendar-alt"></i> Book Now
                    </button>
                    <button class="btn btn-outline">
                        <i class="fas fa-heart"></i> Save
                    </button>
                    <button class="btn btn-outline">
                        <i class="fas fa-share"></i> Share
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Setup event listeners
function setupEventListeners() {
    // View toggle
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentView = button.dataset.view;
            listingsContainer.className = `listings-grid ${currentView}-view`;
        });
    });
    
    // Search
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Filters
    if (applyFiltersBtn) {
        applyFiltersBtn.addEventListener('click', applyFilters);
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetFilters);
    }
    
    // Pagination
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                loadPlaces();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(samplePlaces.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                loadPlaces();
            }
        });
    }
    
    // Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}

// Handle search
function handleSearch() {
    currentFilters.searchQuery = searchInput.value.trim();
    currentPage = 1;
    loadPlaces();
}

// Apply filters
function applyFilters() {
    const selectedCategories = [];
    document.querySelectorAll('input[name="category"]:checked').forEach(checkbox => {
        selectedCategories.push(checkbox.value);
    });
    
    currentFilters.categories = selectedCategories.length > 0 ? selectedCategories : ['attraction', 'hotel', 'restaurant'];
    currentFilters.priceRange = parseInt(document.getElementById('price-range').value);
    currentFilters.minRating = parseInt(document.querySelector('input[name="rating"]:checked').value);
    
    currentPage = 1;
    loadPlaces();
}

// Reset filters
function resetFilters() {
    // Reset checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = ['attraction', 'hotel', 'restaurant'].includes(checkbox.value);
    });
    
    // Reset price range
    document.getElementById('price-range').value = 4;
    
    // Reset rating
    document.getElementById('5-stars').checked = true;
    
    // Reset search
    searchInput.value = '';
    
    // Reset filters
    currentFilters = {
        categories: ['attraction', 'hotel', 'restaurant'],
        priceRange: 4,
        minRating: 3,
        searchQuery: ''
    };
    
    currentPage = 1;
    loadPlaces();
}

// Update pagination controls
function updatePaginationControls(totalPages) {
    if (prevPageBtn) {
        prevPageBtn.disabled = currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = currentPage >= totalPages;
    }
    
    if (pageInfo) {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}

// Helper function to format category
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

// Helper function to generate star rating HTML
function generateStarRating(rating, isLarge = false) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    const starSize = isLarge ? '1.5rem' : '1rem';
    
    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
        stars += `<i class="fas fa-star" style="color: #ffc107; font-size: ${starSize};"></i>`;
    }
    
    // Half star
    if (hasHalfStar) {
        stars += `<i class="fas fa-star-half-alt" style="color: #ffc107; font-size: ${starSize};"></i>`;
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
        stars += `<i class="far fa-star" style="color: #ffc107; font-size: ${starSize};"></i>`;
    }
    
    return stars;
}

// Initialize authentication state
function initAuthState() {
    const user = getUser();
    const userMenu = document.getElementById('user-menu');
    const usernameSpan = document.getElementById('username');
    const logoutBtn = document.getElementById('logout-btn');
    const authButtons = document.getElementById('auth-buttons');
    
    if (user && userMenu && usernameSpan) {
        userMenu.style.display = 'flex';
        usernameSpan.textContent = user.name || user.email;
        if (authButtons) authButtons.style.display = 'none';
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login.html';
        });
    }
}

// Initialize the page
initAuthState();
