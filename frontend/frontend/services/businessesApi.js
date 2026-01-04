/**
 * Businesses API Service
 */
class BusinessesApi {
    constructor() {
        this.baseUrl = '/api/businesses';
    }

    async getAll() {
        return await api.get(this.baseUrl);
    }

    async getById(id) {
        return await api.get(`${this.baseUrl}/${id}`);
    }

    async create(item) {
        return await api.post(this.baseUrl, item);
    }

    async update(id, item) {
        return await api.put(`${this.baseUrl}/${id}`, item);
    }

    async delete(id) {
        return await api.delete(`${this.baseUrl}/${id}`);
    }
}
const businessesApi = new BusinessesApi();
