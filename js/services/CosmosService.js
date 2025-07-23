import ApiService from './ApiService';

class CosmosService extends ApiService {
    constructor(networkConfig) {
        super(networkConfig);
    }

    async getValidators() {
        try {
            const data = await this.fetchWithTimeout(`${this.baseRpcUrl}${this.endpoints.validators}`);
            return data.result.validators;
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
            const url = `${this.baseRpcUrl}${this.endpoints.tx.replace('{hash}', hash)}`;
            const data = await this.fetchWithTimeout(url);
            return data.result;
        } catch (error) {
            console.error(`Error fetching transaction ${hash}:`, error);
            throw error;
        }
    }
}

export default CosmosService;