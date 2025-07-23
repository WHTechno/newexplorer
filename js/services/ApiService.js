import { ENDPOINTS } from '../config/endpoints';

class ApiService {
    constructor(networkConfig) {
        this.network = networkConfig;
        this.baseRpcUrl = networkConfig.rpc;
        this.baseApiUrl = networkConfig.api;
        this.endpoints = ENDPOINTS[networkConfig.type];
    }

    async fetchWithTimeout(resource, options = {}) {
        const { timeout = 10000, ...rest } = options;
        
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        
        try {
            const response = await fetch(resource, {
                ...rest,
                signal: controller.signal
            });
            clearTimeout(id);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(id);
            throw error;
        }
    }

    async getStatus() {
        if (!this.endpoints.status) {
            throw new Error('Status endpoint not available for this network type');
        }
        try {
            const data = await this.fetchWithTimeout(`${this.baseRpcUrl}${this.endpoints.status}`);
            return data.result;
        } catch (error) {
            console.error('Error fetching status:', error);
            throw error;
        }
    }

    async getBlock(height) {
        if (!this.endpoints.block) {
            throw new Error('Block endpoint not available for this network type');
        }
        try {
            const url = `${this.baseRpcUrl}${this.endpoints.block.replace('{height}', height)}`;
            const data = await this.fetchWithTimeout(url);
            return data.result;
        } catch (error) {
            console.error(`Error fetching block ${height}:`, error);
            throw error;
        }
    }

    async getLatestBlocks(limit = 10) {
        try {
            const status = await this.getStatus();
            const latestHeight = parseInt(status.sync_info.latest_block_height);
            const minHeight = Math.max(1, latestHeight - limit + 1);
            
            const url = `${this.baseRpcUrl}${this.endpoints.blockchain}`
                .replace('{min}', minHeight)
                .replace('{max}', latestHeight);
            
            const data = await this.fetchWithTimeout(url);
            
            if (data.result && data.result.block_metas) {
                return data.result.block_metas.reverse();
            }
            return [];
        } catch (error) {
            console.error('Error fetching latest blocks:', error);
            throw error;
        }
    }
}

export default ApiService;