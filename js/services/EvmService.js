import ApiService from './ApiService.js';
import { JSON_RPC_METHODS } from '../config/endpoints.js';

class EvmService extends ApiService {
    constructor(networkConfig) {
        super(networkConfig);
    }

    async jsonRpcRequest(method, params = []) {
        try {
            const response = await fetch(this.baseRpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method,
                    params,
                    id: 1
                })
            });
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error(`JSON-RPC ${method} error:`, error);
            throw error;
        }
    }

    async getLatestBlockNumber() {
        return this.jsonRpcRequest(JSON_RPC_METHODS.eth_blockNumber);
    }

    async getBlockByNumber(blockNumber, fullTransactions = false) {
        return this.jsonRpcRequest(JSON_RPC_METHODS.eth_getBlockByNumber, [blockNumber, fullTransactions]);
    }

    async getTransactionReceipt(txHash) {
        return this.jsonRpcRequest(JSON_RPC_METHODS.eth_getTransactionReceipt, [txHash]);
    }

    async getAccountBalance(address, block = 'latest') {
        return this.jsonRpcRequest(JSON_RPC_METHODS.eth_getBalance, [address, block]);
    }
}

export default EvmService;