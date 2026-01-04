/**
 * Business News API Service
 */
class BusinessNewsApi {
    constructor() {
        this.baseUrl = '/api/business-news';
    }

    async getAll() {
        return await api.get(this.baseUrl);
    }

    async getById(id) {
        return await api.get(`${this.baseUrl}/${id}`);
    }

    async create(item, industryId) {
        return await api.post(`${this.baseUrl}?industryId=${industryId}`, item);
    }

    async update(id, item) {
        return await api.put(`${this.baseUrl}/${id}`, item);
    }

    async delete(id) {
        return await api.delete(`${this.baseUrl}/${id}`);
    }
}
const businessNewsApi = new BusinessNewsApi();
