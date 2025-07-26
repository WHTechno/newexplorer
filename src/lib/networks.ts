export interface Network {
  id: string;
  name: string;
  chainId: string;
  rpcEndpoint: string;
  lcdEndpoint: string;
  coinSymbol: string;
  coinDecimals: number;
  logo?: string;
  description?: string;
}

export const NETWORKS: Network[] = [
  {
    id: 'axone',
    name: 'Axone',
    chainId: 'axone-1',
    rpcEndpoint: 'https://api-axone.winsnip.site',
    lcdEndpoint: 'https://api-axone.winsnip.site',
    coinSymbol: 'AXONE',
    coinDecimals: 6,
    description: 'Axone Network'
  },
  {
    id: 'kii',
    name: 'KII Chain',
    chainId: 'oro_1336-1',
    rpcEndpoint: 'https://lcd.dos.sentry.testnet.v3.kiivalidator.com',
    lcdEndpoint: 'https://lcd.dos.sentry.testnet.v3.kiivalidator.com',
    coinSymbol: 'KII',
    coinDecimals: 18,
    description: 'KII Testnet'
  },
  {
    id: 'cosmoshub',
    name: 'Cosmos Hub',
    chainId: 'cosmoshub-4',
    rpcEndpoint: 'https://rpc-cosmoshub.blockapsis.com',
    lcdEndpoint: 'https://lcd-cosmoshub.blockapsis.com',
    coinSymbol: 'ATOM',
    coinDecimals: 6,
    description: 'Cosmos Hub Mainnet'
  },
  {
    id: 'osmosis',
    name: 'Osmosis',
    chainId: 'osmosis-1',
    rpcEndpoint: 'https://rpc.osmosis.zone',
    lcdEndpoint: 'https://lcd.osmosis.zone',
    coinSymbol: 'OSMO',
    coinDecimals: 6,
    description: 'Osmosis DEX'
  },
  {
    id: 'juno',
    name: 'Juno',
    chainId: 'juno-1',
    rpcEndpoint: 'https://rpc-juno.blockapsis.com',
    lcdEndpoint: 'https://lcd-juno.blockapsis.com',
    coinSymbol: 'JUNO',
    coinDecimals: 6,
    description: 'Juno Smart Contracts'
  }
];

export const DEFAULT_NETWORK = NETWORKS[0]; // Axone as default

export function getNetworkById(id: string): Network | undefined {
  return NETWORKS.find(network => network.id === id);
}

export function getNetworkByChainId(chainId: string): Network | undefined {
  return NETWORKS.find(network => network.chainId === chainId);
}
