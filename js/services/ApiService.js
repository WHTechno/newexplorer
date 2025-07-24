import { ENDPOINTS } from '../config/endpoints.js';

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
            const data = await this.fetchWithTimeout(`${this.baseApiUrl}${this.endpoints.status}`);
            return data;
        } catch (error) {
            console.error('Error fetching status:', error);
            throw error;
        }
    }

    async getLatestBlock() {
        if (!this.endpoints.latestBlock) {
            throw new Error('Latest block endpoint not available for this network type');
        }
        try {
            const data = await this.fetchWithTimeout(`${this.baseApiUrl}${this.endpoints.latestBlock}`);
            return data;
        } catch (error) {
            console.error('Error fetching latest block:', error);
            throw error;
        }
    }

    async getBlock(height) {
        if (!this.endpoints.block) {
            throw new Error('Block endpoint not available for this network type');
        }
        try {
            const url = `${this.baseApiUrl}${this.endpoints.block.replace('{height}', height)}`;
            const data = await this.fetchWithTimeout(url);
            return data;
        } catch (error) {
            console.error(`Error fetching block ${height}:`, error);
            throw error;
        }
    }

    async getLatestBlocks(limit = 10) {
        try {
            const latestBlock = await this.getLatestBlock();
            if (!latestBlock?.block?.header?.height) {
                throw new Error('Unable to get latest block height');
            }
            
            const latestHeight = parseInt(latestBlock.block.header.height);
            const blocks = [];
            
            // Fetch the last 'limit' blocks
            for (let i = 0; i < limit && (latestHeight - i) > 0; i++) {
                try {
                    const blockHeight = latestHeight - i;
                    const block = await this.getBlock(blockHeight);
                    if (block?.block) {
                        blocks.push({
                            header: block.block.header,
                            block_id: block.block_id,
                            num_txs: block.block.data?.txs?.length || 0
                        });
                    }
                } catch (blockError) {
                    console.warn(`Failed to fetch block ${latestHeight - i}:`, blockError);
                    // Continue with other blocks even if one fails
                }
            }
            
            return blocks;
        } catch (error) {
            console.error('Error fetching latest blocks:', error);
            throw error;
        }
    }
}

export default ApiService;