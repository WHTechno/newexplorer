const ENDPOINTS = {
    cosmos: {
        status: '/status',
        block: '/block?height={height}',
        blockchain: '/blockchain?minHeight={min}&maxHeight={max}',
        validators: '/validators',
        tx: '/tx?hash={hash}',
        account: '/cosmos/auth/v1beta1/accounts/{address}'
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