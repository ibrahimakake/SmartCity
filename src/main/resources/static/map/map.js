// Map Logic using Leaflet

let map;
let markers = [];

document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Default to Casablanca
    // 33.5731, -7.5898 (Casablanca)
    map = L.map('map-container').setView([33.5731, -7.5898], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    // Load initial markers (all)
    loadMarkers('all');
}

function filterMap(type) {
    if (!map) return;
    loadMarkers(type);
}

function loadMarkers(type) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];

    // Mock Data for Casablanca
    const places = [
        { name: 'Grand Mogador City Center', type: 'hotels', lat: 33.5900, lng: -7.6000 },
        { name: 'Hyatt Regency', type: 'hotels', lat: 33.5950, lng: -7.6100 },
        { name: 'Rick\'s Café', type: 'restaurants', lat: 33.6060, lng: -7.6180 },
        { name: 'La Sqala', type: 'restaurants', lat: 33.6010, lng: -7.6150 },
        { name: 'Megarama Cinema', type: 'theatres', lat: 33.6000, lng: -7.6500 },
        { name: 'Hassan II Mosque', type: 'attractions', lat: 33.6080, lng: -7.6320 }
    ];

    places.forEach(place => {
        if (type === 'all' || place.type === type) {
            const marker = L.marker([place.lat, place.lng])
                .addTo(map)
                .bindPopup(`<b>${place.name}</b><br>${place.type}`);
            markers.push(marker);
        }
    });
}
