import { NETWORKS, DEFAULT_NETWORK } from '../config/networks.js';
import CosmosService from '../services/CosmosService.js';
import EvmService from '../services/EvmService.js';

class NetworkStore {
    constructor() {
        this.currentNetwork = DEFAULT_NETWORK;
        this.apiService = this.createApiService(DEFAULT_NETWORK);
        this.isConnected = false;
        this.subscribers = [];
    }

    createApiService(networkConfig) {
        return networkConfig.type === 'cosmos' 
            ? new CosmosService(networkConfig) 
            : new EvmService(networkConfig);
    }

    subscribe(callback) {
        this.subscribers.push(callback);
        return () => {
            this.subscribers = this.subscribers.filter(sub => sub !== callback);
        };
    }

    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.currentNetwork));
    }

    async switchNetwork(networkId) {
        const network = Object.values(NETWORKS)
            .flatMap(n => [n.testnet, n.mainnet].filter(Boolean))
            .find(n => n.id === networkId);

        if (!network) {
            throw new Error(`Network ${networkId} not found`);
        }

        this.currentNetwork = network;
        this.apiService = this.createApiService(network);

        try {
            await this.testConnection();
            this.isConnected = true;
            this.notifySubscribers();
            return true;
        } catch (error) {
            this.isConnected = false;
            throw error;
        }
    }

    async testConnection() {
        try {
            if (this.currentNetwork.type === 'cosmos') {
                await this.apiService.getStatus();
            } else {
                await this.apiService.getLatestBlockNumber();
            }
            return true;
        } catch (error) {
            throw new Error(`Connection to ${this.currentNetwork.name} failed: ${error.message}`);
        }
    }

    getCurrentNetwork() {
        return this.currentNetwork;
    }

    getApiService() {
        return this.apiService;
    }
}

const networkStore = new NetworkStore();
export default networkStore;