const ENDPOINTS = {
    cosmos: {
        // Cosmos REST API endpoints
        status: '/cosmos/base/tendermint/v1beta1/node_info',
        latestBlock: '/cosmos/base/tendermint/v1beta1/blocks/latest',
        block: '/cosmos/base/tendermint/v1beta1/blocks/{height}',
        validators: '/cosmos/base/tendermint/v1beta1/validatorsets/latest',
        validatorsByHeight: '/cosmos/base/tendermint/v1beta1/validatorsets/{height}',
        tx: '/cosmos/tx/v1beta1/txs/{hash}',
        txs: '/cosmos/tx/v1beta1/txs',
        account: '/cosmos/auth/v1beta1/accounts/{address}',
        // Additional useful endpoints
        supply: '/cosmos/bank/v1beta1/supply',
        params: '/cosmos/auth/v1beta1/params'
    },
    evm: {
        status: '', // Not applicable
        block: '', // Use JSON-RPC
        transaction: '', // Use JSON-RPC
        account: '' // Use JSON-RPC
    }
};

const JSON_RPC_METHODS = {
    eth_blockNumber: 'eth_blockNumber',
    eth_getBlockByNumber: 'eth_getBlockByNumber',
    eth_getTransactionReceipt: 'eth_getTransactionReceipt',
    eth_getBalance: 'eth_getBalance'
};

export { ENDPOINTS, JSON_RPC_METHODS };