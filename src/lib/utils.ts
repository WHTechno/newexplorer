import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format timestamp to human readable format
export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Format time ago
export function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const time = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} detik yang lalu`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  }
}

// Format numbers with commas
export function formatNumber(num: number | string): string {
  const number = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('id-ID').format(number);
}

// Format large numbers with K, M, B suffixes
export function formatCompactNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B';
  } else if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M';
  } else if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  }
  return num.toString();
}

// Parse transaction type to readable format
export function parseTxType(rawType: string): string {
  if (!rawType) return 'Unknown';
  
  // Remove common prefixes
  let type = rawType.replace(/^\/cosmos\./, '').replace(/^\//, '');
  
  // Convert to readable format
  const typeMap: { [key: string]: string } = {
    'bank.v1beta1.MsgSend': 'Transfer',
    'staking.v1beta1.MsgDelegate': 'Delegate',
    'staking.v1beta1.MsgUndelegate': 'Undelegate',
    'staking.v1beta1.MsgBeginRedelegate': 'Redelegate',
    'distribution.v1beta1.MsgWithdrawDelegatorReward': 'Claim Rewards',
    'gov.v1beta1.MsgVote': 'Vote',
    'gov.v1beta1.MsgSubmitProposal': 'Submit Proposal',
    'ibc.core.channel.v1.MsgRecvPacket': 'IBC Receive',
    'ibc.core.channel.v1.MsgAcknowledgement': 'IBC Acknowledge',
  };

  return typeMap[type] || type.split('.').pop()?.replace('Msg', '') || 'Unknown';
}

// Truncate address for display
export function truncateAddress(address: string, startLength = 6, endLength = 4): string {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
}

// Truncate hash for display
export function truncateHash(hash: string, length = 8): string {
  if (!hash) return '';
  if (hash.length <= length * 2) return hash;
  return `${hash.slice(0, length)}...${hash.slice(-length)}`;
}

// Format token amount
export function formatTokenAmount(amount: string | number, denom = 'ATOM', decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = (num / Math.pow(10, decimals)).toFixed(6);
  return `${parseFloat(formatted).toLocaleString()} ${denom}`;
}

// Format token amount with network
export function formatTokenAmountWithNetwork(amount: string | number, coinSymbol: string, decimals = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  const formatted = (num / Math.pow(10, decimals)).toFixed(6);
  return `${parseFloat(formatted).toLocaleString()} ${coinSymbol}`;
}

// Get validator status color
export function getValidatorStatusColor(status: string): string {
  switch (status) {
    case 'BOND_STATUS_BONDED':
      return 'text-green-600 bg-green-100';
    case 'BOND_STATUS_UNBONDING':
      return 'text-yellow-600 bg-yellow-100';
    case 'BOND_STATUS_UNBONDED':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

// Get validator status text
export function getValidatorStatusText(status: string): string {
  switch (status) {
    case 'BOND_STATUS_BONDED':
      return 'Active';
    case 'BOND_STATUS_UNBONDING':
      return 'Unbonding';
    case 'BOND_STATUS_UNBONDED':
      return 'Inactive';
    default:
      return 'Unknown';
  }
}

// Calculate voting power percentage
export function calculateVotingPowerPercentage(tokens: string, totalTokens: string): number {
  const validatorTokens = parseFloat(tokens);
  const total = parseFloat(totalTokens);
  return total > 0 ? (validatorTokens / total) * 100 : 0;
}

// Format percentage
export function formatPercentage(percentage: number, decimals = 2): string {
  return `${percentage.toFixed(decimals)}%`;
}

// Check if string is valid address (support any bech32 prefix)
export function isValidAddress(address: string): boolean {
  // Cosmos SDK address: bech32, 39-59 chars, lowercase, starts with a-z prefix
  return /^[a-z][a-z0-9]{2,20}1[0-9a-z]{30,60}$/.test(address);
}

// Check if string is valid transaction hash
export function isValidTxHash(hash: string): boolean {
  return /^[A-Fa-f0-9]{64}$/.test(hash);
}

// Check if string is valid block height
export function isValidBlockHeight(height: string): boolean {
  return /^\d+$/.test(height) && parseInt(height) > 0;
}

// Determine search type
export function determineSearchType(query: string): 'block' | 'tx' | 'address' | 'unknown' {
  if (isValidBlockHeight(query)) {
    return 'block';
  } else if (isValidTxHash(query)) {
    return 'tx';
  } else if (isValidAddress(query)) {
    return 'address';
  }
  return 'unknown';
}

// Konversi base64 ke hex
export function base64ToHex(base64: string): string {
  if (!base64) return '';
  // atob tidak tersedia di Node.js, gunakan Buffer
  const buffer = typeof window === 'undefined'
    ? Buffer.from(base64, 'base64')
    : Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  return Array.from(buffer)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Hash SHA256 dari base64 tx (Node.js & browser)
export async function getTxHashFromBase64(base64: string): Promise<string> {
  if (!base64) return '';
  if (typeof window === 'undefined') {
    // Node.js
    const { createHash } = await import('crypto');
    const txBytes = Buffer.from(base64, 'base64');
    return createHash('sha256').update(txBytes).digest('hex').toUpperCase();
  } else {
    // Browser
    const txBytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', txBytes);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
}
