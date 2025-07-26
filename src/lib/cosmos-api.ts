import { Network } from './networks';
import { getTxHashFromBase64 } from './utils';

// Helper function for API calls with error handling
async function apiCall(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
}

// Get latest block
export async function getLatestBlock(network: Network) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/latest`);
  return data.block;
}

// Get block by height (gunakan REST API/lcdEndpoint)
export async function getBlockByHeight(network: Network, height: string) {
  try {
    const url = height === 'latest'
      ? `${network.lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/latest`
      : `${network.lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/${height}`;
    const data = await apiCall(url);
    return data.block;
  } catch (error) {
    console.error(`REST call failed for block ${height}:`, error);
    throw error;
  }
}

// Get latest validator set
export async function getLatestValidatorSet(network: Network) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/base/tendermint/v1beta1/validatorsets/latest`);
  return data.validators;
}

// Get all validators with enhanced data
export async function getAllValidators(network: Network) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/staking/v1beta1/validators`);
  const validators = data.validators || [];
  
  // Enhance validators with keybase profile pictures
  const enhancedValidators = await Promise.all(
    validators.map(async (validator: any) => {
      const identity = validator.description?.identity;
      let profilePicture = null;
      
      if (identity && identity.length > 0) {
        try {
          profilePicture = await getKeybaseProfilePicture(identity);
        } catch (error) {
          console.warn(`Failed to fetch keybase profile for ${validator.description?.moniker}:`, error);
        }
      }
      
      return {
        ...validator,
        profilePicture
      };
    })
  );
  
  return enhancedValidators;
}

// Get keybase profile picture
async function getKeybaseProfilePicture(identity: string): Promise<string | null> {
  try {
    const response = await fetch(`https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${identity}&fields=pictures`);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.them && data.them.length > 0 && data.them[0].pictures?.primary?.url) {
      return data.them[0].pictures.primary.url;
    }
    return null;
  } catch (error) {
    console.warn('Keybase API error:', error);
    return null;
  }
}

// Get validator by operator address with enhanced data
export async function getValidatorByAddress(network: Network, address: string) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/staking/v1beta1/validators/${address}`);
  const validator = data.validator;
  
  // Enhance with keybase profile picture
  const identity = validator.description?.identity;
  let profilePicture = null;
  
  if (identity && identity.length > 0) {
    try {
      profilePicture = await getKeybaseProfilePicture(identity);
    } catch (error) {
      console.warn(`Failed to fetch keybase profile for ${validator.description?.moniker}:`, error);
    }
  }
  
  return {
    ...validator,
    profilePicture
  };
}

// Get transaction by hash
export async function getTransactionByHash(network: Network, hash: string) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/tx/v1beta1/txs/${hash}`);
  return data.tx_response;
}

// Search transaction by hash (for search functionality)
export async function searchTransactionByHash(network: Network, hash: string) {
  try {
    const data = await apiCall(`${network.lcdEndpoint}/cosmos/tx/v1beta1/txs/${hash}`);
    return {
      found: true,
      transaction: data.tx_response,
      type: 'transaction'
    };
  } catch (error) {
    return {
      found: false,
      error: 'Transaksi tidak ditemukan',
      type: 'transaction'
    };
  }
}

// Search address information using delegations endpoint
export async function searchAddressByAddress(network: Network, address: string) {
  try {
    // Use delegations endpoint to search for address as requested
    const [delegationsData, accountData, balanceData] = await Promise.allSettled([
      apiCall(`${network.lcdEndpoint}/cosmos/staking/v1beta1/delegations/${address}`),
      apiCall(`${network.lcdEndpoint}/cosmos/auth/v1beta1/accounts/${address}`),
      apiCall(`${network.lcdEndpoint}/cosmos/bank/v1beta1/balances/${address}`)
    ]);

    const delegations = delegationsData.status === 'fulfilled' ? delegationsData.value.delegation_responses : [];
    const account = accountData.status === 'fulfilled' ? accountData.value.account : null;
    const balances = balanceData.status === 'fulfilled' ? balanceData.value.balances : [];

    // If account exists, consider the address found (even if delegations/balances are empty)
    if (account) {
      return {
        found: true,
        account,
        balances,
        delegations,
        type: 'address'
      };
    }

    return {
      found: false,
      error: 'Alamat tidak ditemukan atau tidak valid',
      type: 'address'
    };
  } catch (error) {
    return {
      found: false,
      error: 'Alamat tidak ditemukan atau tidak valid',
      type: 'address'
    };
  }
}

// Get recent transactions with pagination
export async function getRecentTransactions(network: Network, limit = 10, offset = 0) {
  const latestBlock = await getLatestBlock(network);
  const blockTxs = latestBlock.data?.txs || [];
  // Format block transactions to match expected structure
  const formattedTxs = await Promise.all(blockTxs.map(async (txData: string) => ({
    txhash: await getTxHashFromBase64(txData),
    height: latestBlock.header.height,
    timestamp: latestBlock.header.time,
    tx: {
      body: {
        messages: [{
          '@type': '/cosmos.bank.v1beta1.MsgSend',
          from_address: 'unknown',
          to_address: 'unknown',
          amount: []
        }]
      },
      auth_info: {
        fee: {
          amount: [{ denom: network.coinSymbol.toLowerCase(), amount: '0' }],
          gas_limit: '0'
        }
      }
    },
    code: 0,
    gas_used: '0',
    gas_wanted: '0',
    raw_data: txData
  })));
  return {
    transactions: formattedTxs,
    pagination: null,
    total: formattedTxs.length
  };
}

// Get transactions with pagination key
export async function getTransactions(network: Network, limit = 10, paginationKey?: string) {
  let url = `${network.lcdEndpoint}/cosmos/tx/v1beta1/txs?limit=${limit}&order_by=ORDER_BY_DESC`;
  if (paginationKey) {
    url += `&pagination.key=${encodeURIComponent(paginationKey)}`;
  }
  try {
    const data = await apiCall(url);
    if (data.tx_responses && data.tx_responses.length > 0) {
      return {
        transactions: data.tx_responses.slice(0, limit),
        pagination: data.pagination || null,
        total: data.pagination?.total ? Number(data.pagination.total) : data.tx_responses.length
      };
    } else {
      // Fallback ke blok terbaru jika tidak ada transaksi
      const fallback = await getRecentTransactions(network, limit);
      return { ...fallback, transactions: fallback.transactions.slice(0, limit), total: fallback.total };
    }
  } catch (err) {
    // Fallback ke blok terbaru jika error
    const fallback = await getRecentTransactions(network, limit);
    return { ...fallback, transactions: fallback.transactions.slice(0, limit), total: fallback.total };
  }
}

// Get account info
export async function getAccountInfo(network: Network, address: string) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/auth/v1beta1/accounts/${address}`);
  return data.account;
}

// Get account balances
export async function getAccountBalances(network: Network, address: string) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/bank/v1beta1/balances/${address}`);
  return data.balances;
}

// Get delegations for an address
export async function getDelegations(network: Network, address: string) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/staking/v1beta1/delegations/${address}`);
  return data.delegation_responses;
}

// Get staking rewards
export async function getStakingRewards(network: Network, address: string) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/distribution/v1beta1/delegators/${address}/rewards`);
  return data.rewards;
}

// Get validator signing info (slashing)
export async function getValidatorSigningInfo(network: Network) {
  const data = await apiCall(`${network.lcdEndpoint}/cosmos/slashing/v1beta1/signing_infos`);
  return data.info;
}

// Get chain parameters and supply info
export async function getChainInfo(network: Network) {
  try {
    const [latestBlock, validators] = await Promise.all([
      getLatestBlock(network),
      getLatestValidatorSet(network)
    ]);

    return {
      latestBlockHeight: latestBlock.header.height,
      chainId: latestBlock.header.chain_id,
      validatorCount: validators.length,
      latestBlockTime: latestBlock.header.time,
    };
  } catch (error) {
    console.error('Error fetching chain info:', error);
    throw error;
  }
}

// Get blocks with pagination
export async function getBlocks(network: Network, page = 1, limit = 10) {
  try {
    const latestBlock = await getLatestBlock(network);
    const latestHeight = parseInt(latestBlock.header.height);
    const startHeight = Math.max(1, latestHeight - (page - 1) * limit);
    const endHeight = Math.max(1, startHeight - limit + 1);

    const blocks = [];
    for (let height = startHeight; height >= endHeight; height--) {
      try {
        const block = await getBlockByHeight(network, height.toString());
        blocks.push(block);
      } catch (error) {
        console.error(`Error fetching block ${height}:`, error);
      }
    }

    return blocks.map(block => ({ ...block, hash: block.hash }));
  } catch (error) {
    console.error('Error fetching blocks:', error);
    throw error;
  }
}

// Helper function for API calls with error handling
// async function apiCall(url: string) {
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }
//     return await response.json();
//   } catch (error) {
//     console.error(`API call failed for ${url}:`, error);
//     throw error;
//   }
// }

// Get block from RPC endpoint with fallback to LCD
export async function getBlockFromRPC(network: Network, height: string) {
  try {
    const response = await fetch(`${network.rpcEndpoint}/block?height=${height}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.result.block;
  } catch (error) {
    console.warn(`RPC call failed for block ${height}, falling back to LCD:`, error);
    // Fallback to LCD endpoint
    try {
      const lcdData = await apiCall(`${network.lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/${height}`);
      return lcdData.block;
    } catch (lcdError) {
      console.error(`LCD call also failed for block ${height}:`, lcdError);
      throw lcdError;
    }
  }
}

// Health check for RPC and LCD endpoints
export async function checkEndpointHealth(network: Network) {
  const health = {
    rpc: false,
    lcd: false,
  };

  try {
    await apiCall(`${network.lcdEndpoint}/cosmos/base/tendermint/v1beta1/blocks/latest`);
    health.lcd = true;
  } catch (error) {
    console.error('LCD endpoint health check failed:', error);
  }

  try {
    const rpcResponse = await fetch(`${network.rpcEndpoint}/health`);
    health.rpc = rpcResponse.ok;
  } catch (error) {
    console.error('RPC endpoint health check failed:', error);
  }

  return health;
}
