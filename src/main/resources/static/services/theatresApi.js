/**
 * Theatres API Service
 */
class TheatresApi {
    constructor() {
        this.baseUrl = '/api/theatres';
    }

    async getAll() {
        console.log('[TheatresApi] GET /api/theatres');
        return await api.get(this.baseUrl);
    }

    async getById(id) {
        console.log(`[TheatresApi] GET /api/theatres/${id}`);
        return await api.get(`${this.baseUrl}/${id}`);
    }

    async search(query) {
        console.log(`[TheatresApi] SEARCH /api/theatres?query=${query}`);
        return await api.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
    }

    async create(item) {
        console.log('[TheatresApi] POST /api/theatres', item);
        return await api.post(this.baseUrl, item);
    }

    async update(id, item) {
        console.log(`[TheatresApi] PUT /api/theatres/${id}`, item);
        return await api.put(`${this.baseUrl}/${id}`, item);
    }

    async delete(id) {
        console.log(`[TheatresApi] DELETE /api/theatres/${id}`);
        return await api.delete(`${this.baseUrl}/${id}`);
    }

    /**
     * POST /api/theatre-bookings
     */
    async bookToken(bookingData) {
        console.log('[TheatresApi] POST /api/theatre-bookings', bookingData);
        return await api.post('/api/theatre-bookings', bookingData);
    }

    /**
     * POST /api/theatre-bookings/{id}/cancel
     */
    async cancelBooking(id) {
        console.log(`[TheatresApi] POST /api/theatre-bookings/${id}/cancel`);
        return await api.post(`/api/theatre-bookings/${id}/cancel`, {});
    }

    /**
     * GET /api/theatre-bookings/tourist/{id}
     */
    async getMyBookings(touristId) {
        console.log(`[TheatresApi] GET /api/theatre-bookings/tourist/${touristId}`);
        return await api.get(`/api/theatre-bookings/tourist/${touristId}`);
    }
}

const theatresApi = new TheatresApi();
window.theatresApi = theatresApi;  // ← ADD THIS!