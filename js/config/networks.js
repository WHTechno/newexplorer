const NETWORKS = {
    warden: {
        id: 'warden',
        name: 'Warden Protocol',
        type: 'cosmos',
        testnet: {
            id: 'warden-testnet',
            name: 'Warden Testnet',
            rpc: 'https://warden-testnet-rpc.itrocket.net',
            api: 'https://warden-testnet-api.itrocket.net',
            explorer: 'https://explorer.wardenprotocol.org',
            currency: {
                name: 'Warden',
                symbol: 'WARD',
                decimals: 6
            }
        },
        mainnet: {
            id: 'warden-mainnet',
            name: 'Warden Mainnet',
            rpc: 'https://warden-rpc.itrocket.net',
            api: 'https://warden-api.itrocket.net',
            explorer: 'https://explorer.wardenprotocol.org',
            currency: {
                name: 'Warden',
                symbol: 'WARD',
                decimals: 6
            }
        }
    },
    osmosis: {
        id: 'osmosis',
        name: 'Osmosis',
        type: 'cosmos',
        testnet: {
            id: 'osmosis-testnet',
            name: 'Osmosis Testnet',
            rpc: 'https://rpc.testnet.osmosis.zone',
            api: 'https://lcd.testnet.osmosis.zone',
            explorer: 'https://testnet.osmosis.zone',
            currency: {
                name: 'OSMO',
                symbol: 'OSMO',
                decimals: 6
            }
        },
        mainnet: {
            id: 'osmosis-mainnet',
            name: 'Osmosis Mainnet',
            rpc: 'https://rpc.osmosis.zone',
            api: 'https://lcd.osmosis.zone',
            explorer: 'https://app.osmosis.zone',
            currency: {
                name: 'OSMO',
                symbol: 'OSMO',
                decimals: 6
            }
        }
    },
    arbitrum: {
        id: 'arbitrum',
        name: 'Arbitrum',
        type: 'evm',
        testnet: {
            id: 'arbitrum-goerli',
            name: 'Arbitrum Goerli',
            rpc: 'https://goerli-rollup.arbitrum.io/rpc',
            api: 'https://api-goerli.arbiscan.io/api',
            explorer: 'https://goerli.arbiscan.io',
            currency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            }
        },
        mainnet: {
            id: 'arbitrum-mainnet',
            name: 'Arbitrum One',
            rpc: 'https://arb1.arbitrum.io/rpc',
            api: 'https://api.arbiscan.io/api',
            explorer: 'https://arbiscan.io',
            currency: {
                name: 'Ether',
                symbol: 'ETH',
                decimals: 18
            }
        }
    }
};

const DEFAULT_NETWORK = NETWORKS.warden.testnet;

export { NETWORKS, DEFAULT_NETWORK };