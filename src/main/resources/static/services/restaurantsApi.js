/**
 * Restaurants API Service
 */
class RestaurantsApi {
    constructor() {
        this.baseUrl = '/api/restaurants';
    }

    async getAll() {
        console.log('[RestaurantsApi] GET /api/restaurants');
        return await api.get(this.baseUrl);
    }

    async getById(id) {
        console.log(`[RestaurantsApi] GET /api/restaurants/${id}`);
        return await api.get(`${this.baseUrl}/${id}`);
    }

    async search(query) {
        console.log(`[RestaurantsApi] SEARCH /api/restaurants?query=${query}`);
        return await api.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
    }

    async create(item) {
        console.log('[RestaurantsApi] POST /api/restaurants', item);
        return await api.post(this.baseUrl, item);
    }

    async update(id, item) {
        console.log(`[RestaurantsApi] PUT /api/restaurants/${id}`, item);
        return await api.put(`${this.baseUrl}/${id}`, item);
    }

    async delete(id) {
        console.log(`[RestaurantsApi] DELETE /api/restaurants/${id}`);
        return await api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * POST /api/restaurant-reservations
     */
    async reserve(reservationData) {
        console.log('[RestaurantsApi] POST /api/restaurant-reservations', reservationData);
        return await api.post('/api/restaurant-reservations', reservationData);
    }

    /**
     * POST /api/restaurant-reservations/{id}/cancel
     */
    async cancelReservation(id) {
        console.log(`[RestaurantsApi] POST /api/restaurant-reservations/${id}/cancel`);
        return await api.post(`/api/restaurant-reservations/${id}/cancel`, {});
    }
    /**
     * GET /api/restaurant-reservations/tourist/{id}
     */
    async getMyReservations(touristId) {
        console.log(`[RestaurantsApi] GET /api/restaurant-reservations/tourist/${touristId}`);
        return await api.get(`/api/restaurant-reservations/tourist/${touristId}`);
    }
}
const restaurantsApi = new RestaurantsApi();
