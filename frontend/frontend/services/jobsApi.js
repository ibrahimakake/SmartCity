/**
 * Job Listings API Service
 */
class JobsApi {
    constructor() {
        this.baseUrl = '/api/job-listings';
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

    async create(item, companyId, industryId) {
        return await api.post(`${this.baseUrl}?companyId=${companyId}&industryId=${industryId}`, item);
    }

    async update(id, item) {
        return await api.put(`${this.baseUrl}/${id}`, item);
    }

    async delete(id) {
        return await api.delete(`${this.baseUrl}/${id}`);
    }
}
const jobsApi = new JobsApi();
