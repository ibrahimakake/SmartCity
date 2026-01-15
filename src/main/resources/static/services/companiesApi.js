/**
 * Companies API Service
 */
class CompaniesApi {
    constructor() {
        this.baseUrl = '/api/companies';
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
const companiesApi = new CompaniesApi();
