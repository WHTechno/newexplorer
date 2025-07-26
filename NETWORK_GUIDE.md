# Multi-Network Cosmos Explorer - Network Configuration Guide

## Adding New Networks

To add a new Cosmos SDK network to the explorer, simply edit the `src/lib/networks.ts` file and add your network configuration to the `NETWORKS` array.

### Network Configuration Format

```typescript
{
  id: 'unique-network-id',           // Unique identifier for the network
  name: 'Network Display Name',      // Name shown in the UI
  chainId: 'chain-id-1',            // Official chain ID
  rpcEndpoint: 'https://rpc.example.com',     // RPC endpoint URL
  lcdEndpoint: 'https://lcd.example.com',     // LCD/REST API endpoint URL
  coinSymbol: 'TOKEN',              // Native token symbol (e.g., ATOM, OSMO)
  coinDecimals: 6,                  // Token decimal places (usually 6)
  description: 'Network Description' // Optional description
}
```

### Example: Adding a New Network

1. Open `src/lib/networks.ts`
2. Add your network to the `NETWORKS` array:

```typescript
export const NETWORKS: Network[] = [
  // ... existing networks ...
  {
    id: 'stargaze',
    name: 'Stargaze',
    chainId: 'stargaze-1',
    rpcEndpoint: 'https://rpc.stargaze-apis.com',
    lcdEndpoint: 'https://rest.stargaze-apis.com',
    coinSymbol: 'STARS',
    coinDecimals: 6,
    description: 'Stargaze NFT Marketplace'
  }
];
```

3. Save the file - the new network will automatically appear in the network selector!

### Current Supported Networks

- **Axone** (axone-1) - Default network
- **Cosmos Hub** (cosmoshub-4) - ATOM
- **Osmosis** (osmosis-1) - OSMO  
- **Juno** (juno-1) - JUNO

### Features

✅ **Automatic Network Switching**: All API calls automatically use the selected network's endpoints
✅ **Persistent Selection**: Network choice is saved in localStorage
✅ **Dynamic UI Updates**: Chain ID, coin symbols, and all data update automatically
✅ **Error Handling**: Graceful handling of network connectivity issues
✅ **Real-time Data**: Live blockchain data from each network's endpoints

### Network Requirements

For a network to work properly, it needs:
- ✅ Active LCD/REST API endpoint with Cosmos SDK standard endpoints
- ✅ RPC endpoint (for health checks)
- ✅ Standard Cosmos SDK modules (bank, staking, gov, etc.)

### Troubleshooting

If a network doesn't load data:
1. Check if the endpoints are accessible
2. Verify the endpoints support standard Cosmos SDK REST API
3. Check browser console for specific API errors
4. Ensure CORS is properly configured on the endpoints

### Easy Configuration

The explorer is designed to be easily configurable for any Cosmos SDK network. Simply:
1. Add network configuration
2. Deploy the explorer
3. Users can switch between networks seamlessly!

Perfect for:
- Multi-chain organizations
- Cosmos ecosystem explorers
- Development and testing environments
- Community-run explorers
