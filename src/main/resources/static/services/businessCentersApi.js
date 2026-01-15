/**
 * Business Centers API Service
 */
class BusinessCentersApi {
    constructor() {
        this.baseUrl = '/api/business-centers';
    }

    async getAll() {
        return await api.get(this.baseUrl);
    }

    async getById(id) {
        return await api.get(`${this.baseUrl}/${id}`);
    }

    async search(query) {
        return await api.get(`${this.baseUrl}/search?query=${encodeURIComponent(query)}`);
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
const businessCentersApi = new BusinessCentersApi();
