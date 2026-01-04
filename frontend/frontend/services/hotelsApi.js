/**
 * Hotels API Service
 * Handles all backend interactions for Hotel management.
 */

class HotelsApi {
    constructor() {
        this.baseUrl = '/api/hotels';
    }

    /**
     * GET /api/hotels
     * @returns {Promise<Array>} List of hotels
     */
    async getAll() {
        console.log('[HotelsApi] GET /api/hotels');
        return await api.get(this.baseUrl);
    }

    /**
     * GET /api/hotels/{id}
     * @param {string} id 
     * @returns {Promise<Object>} Hotel details
     */
    async getById(id) {
        console.log(`[HotelsApi] GET /api/hotels/${id}`);
        return await api.get(`${this.baseUrl}/${id}`);
    }

    /**
     * GET /api/hotels/search?query={query}
     * @param {string} query 
     * @returns {Promise<Array>} List of hotels
     */
    async search(query) {
        console.log(`[HotelsApi] SEARCH /api/hotels?query=${query}`);
        return await api.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
    }

    /**
     * POST /api/hotels
     * @param {Object} hotel 
     * @returns {Promise<Object>} Created hotel
     */
    async create(hotel) {
        console.log('[HotelsApi] POST /api/hotels', hotel);
        return await api.post(this.baseUrl, hotel);
    }

    /**
     * PUT /api/hotels/{id}
     * @param {string} id 
     * @param {Object} hotel 
     * @returns {Promise<Object>} Updated hotel
     */
    async update(id, hotel) {
        console.log(`[HotelsApi] PUT /api/hotels/${id}`, hotel);
        return await api.put(`${this.baseUrl}/${id}`, hotel);
    }

    /**
     * DELETE /api/hotels/{id}
     * @param {string} id 
     * @returns {Promise<void>} 
     */
    async delete(id) {
        console.log(`[HotelsApi] DELETE /api/hotels/${id}`);
        return await api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * POST /api/hotel-bookings
     * @param {Object} bookingData 
     * @returns {Promise<Object>} Created booking
     */
    async book(bookingData) {
        console.log('[HotelsApi] POST /api/hotel-bookings', bookingData);
        return await api.post('/api/hotel-bookings', bookingData);
    }

    /**
     * POST /api/hotel-bookings/{id}/cancel
     * @param {string} bookingId 
     * @returns {Promise<void>} 
     */
    async cancelBooking(bookingId) {
        console.log(`[HotelsApi] POST /api/hotel-bookings/${bookingId}/cancel`);
        return await api.post(`/api/hotel-bookings/${bookingId}/cancel`, {});
    }

    /**
     * GET /api/hotel-bookings/my-bookings?touristId={id}
     * @param {string} touristId 
     * @returns {Promise<Array>} List of bookings
     */
    async getMyBookings(touristId) {
        console.log(`[HotelsApi] GET /api/hotel-bookings/my-bookings?touristId=${touristId}`);
        return await api.get(`/api/hotel-bookings/my-bookings?touristId=${touristId}`);
    }
}

// Export singleton
const hotelsApi = new HotelsApi();
