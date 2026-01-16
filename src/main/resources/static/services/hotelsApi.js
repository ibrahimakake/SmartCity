/**
 * Hotels API Service (Classic script)
 * Requires: window.api (from /shared/api.js)
 * Exposes: window.hotelsApi
 */
(function () {
  'use strict';

  if (!window.api) {
    console.error('[HotelsApi] window.api is not defined. Load /shared/api.js before hotelsApi.js');
    return;
  }

  const baseUrl = '/api/hotels';

  function normalizeHotelsResponse(response) {
    if (Array.isArray(response)) return response;
    if (response && typeof response === 'object') {
      return response.data || response.content || response.hotels || [];
    }
    return [];
  }

  const hotelsApi = {
    async getAll() {
      console.log('[HotelsApi] GET', baseUrl);
      const response = await window.api.get(baseUrl);
      console.log('[HotelsApi] Raw response:', response);

      const hotels = normalizeHotelsResponse(response);
      console.log(`[HotelsApi] Found ${hotels.length} hotels`);
      if (hotels.length > 0) console.log('[HotelsApi] First hotel:', hotels[0]);

      return hotels;
    },

    async getById(id) {
      console.log(`[HotelsApi] GET ${baseUrl}/${id}`);
      return window.api.get(`${baseUrl}/${id}`);
    },

    async search(query) {
      console.log(`[HotelsApi] GET ${baseUrl}/search?query=${query}`);
      return window.api.get(`${baseUrl}/search?query=${encodeURIComponent(query)}`);
    },

    async create(hotel) {
      console.log('[HotelsApi] POST', baseUrl, hotel);
      return window.api.post(baseUrl, hotel);
    },

    async update(id, hotel) {
      console.log(`[HotelsApi] PUT ${baseUrl}/${id}`, hotel);
      return window.api.put(`${baseUrl}/${id}`, hotel);
    },

    async delete(id) {
      console.log(`[HotelsApi] DELETE ${baseUrl}/${id}`);
      return window.api.delete(`${baseUrl}/${id}`);
    },

    async bookRoom(bookingData) {
      console.log('[HotelsApi] POST /api/hotel-bookings', bookingData);
      return window.api.post('/api/hotel-bookings', bookingData);
    },

    async cancelBooking(bookingId) {
      console.log(`[HotelsApi] POST /api/hotel-bookings/${bookingId}/cancel`);
      return window.api.post(`/api/hotel-bookings/${bookingId}/cancel`, {});
    },

    async getMyBookings(touristId) {
      console.log(`[HotelsApi] GET /api/hotel-bookings/my-bookings?touristId=${touristId}`);
      return window.api.get(`/api/hotel-bookings/my-bookings?touristId=${touristId}`);
    }
  };

  window.hotelsApi = hotelsApi;
  console.log('[HotelsApi] window.hotelsApi ready ✅');
})();