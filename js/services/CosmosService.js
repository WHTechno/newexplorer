import ApiService from './ApiService.js';

class CosmosService extends ApiService {
    constructor(networkConfig) {
        super(networkConfig);
    }

    async getValidators() {
        try {
            const data = await this.fetchWithTimeout(`${this.baseApiUrl}${this.endpoints.validators}`);
            return data.validators || [];
        } catch (error) {
            console.error('Error fetching validators:', error);
            throw error;
        }
    }

    async getAccount(address) {
        try {
            const url = `${this.baseApiUrl}${this.endpoints.account.replace('{address}', address)}`;
            const data = await this.fetchWithTimeout(url);
            return data.account;
        } catch (error) {
            console.error(`Error fetching account ${address}:`, error);
            throw error;
        }
    }

    async getTransaction(hash) {
        try {
            const url = `${this.baseApiUrl}${this.endpoints.tx.replace('{hash}', hash)}`;
            const data = await this.fetchWithTimeout(url);
            return data.tx_response;
        } catch (error) {
            console.error(`Error fetching transaction ${hash}:`, error);
            throw error;
        }
    }
}

export default CosmosService;