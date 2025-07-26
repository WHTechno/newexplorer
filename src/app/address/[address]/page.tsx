'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { searchAddressByAddress, getDelegations, getStakingRewards } from '@/lib/cosmos-api';
import { formatTokenAmountWithNetwork, truncateAddress } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1000); }}
      className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-900 rounded hover:bg-gray-300 font-mono border border-gray-300"
      title="Copy address"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function AddressDetailPage() {
  const { currentNetwork } = useNetwork();
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  
  const [addressData, setAddressData] = useState<any>(null);
  const [delegations, setDelegations] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchAddressDetail();
    }
  }, [address, currentNetwork]);

  const fetchAddressDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [addressResult, delegationsResult, rewardsResult] = await Promise.allSettled([
        searchAddressByAddress(currentNetwork, address),
        getDelegations(currentNetwork, address),
        getStakingRewards(currentNetwork, address)
      ]);

      if (addressResult.status === 'fulfilled' && addressResult.value.found) {
        setAddressData(addressResult.value);
      } else {
        setError('Address not found or invalid.');
        return;
      }

      if (delegationsResult.status === 'fulfilled') {
        setDelegations(delegationsResult.value || []);
      }

      if (rewardsResult.status === 'fulfilled') {
        setRewards(rewardsResult.value || []);
      }

    } catch (err) {
      console.error('Error fetching address detail:', err);
      setError('Failed to load address details. Address may not be found.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6 space-x-3">
            <button
              onClick={fetchAddressDetail}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!addressData) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">Address not found</h3>
        </div>
      </Layout>
    );
  }

  const totalBalance = addressData.balances.reduce((total: number, balance: any) => {
    if (balance.denom === `u${currentNetwork.coinSymbol.toLowerCase()}`) {
      return total + parseFloat(balance.amount);
    }
    return total;
  }, 0);

  const totalDelegated = delegations.reduce((total: number, delegation: any) => {
    return total + parseFloat(delegation.balance?.amount || '0');
  }, 0);

  const totalRewards = rewards.reduce((total: number, reward: any) => {
    const mainReward = reward.reward?.find((r: any) => r.denom === `u${currentNetwork.coinSymbol.toLowerCase()}`);
    return total + parseFloat(mainReward?.amount || '0');
  }, 0);

  return (
    <Layout>
      <div className="space-y-6 bg-background min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Address Details</h1>
            </div>
            <div className="flex items-center mt-2">
              <span className="font-mono text-base bg-gray-100 text-gray-900 px-2 py-1 rounded break-all">{address}</span>
              <CopyButton value={address} />
              {addressData.account?.['@type'] && (
                <span className="ml-2 px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
                  {addressData.account['@type'].split('.').pop()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-green-200 text-foreground rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Available Balance</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatTokenAmountWithNetwork(totalBalance, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-blue-200 text-foreground rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Delegated</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTokenAmountWithNetwork(totalDelegated, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white border border-purple-200 text-foreground rounded-xl p-6 shadow-md">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Pending Rewards</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatTokenAmountWithNetwork(totalRewards, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white border border-gray-200 text-foreground rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900">Address Information</h3>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-600">Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all flex items-center">
                  {address}
                  <CopyButton value={address} />
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Account Type</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {addressData.account?.['@type']?.split('.').pop() || 'Standard Account'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Account Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{addressData.account?.account_number || 'N/A'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Sequence</dt>
                <dd className="mt-1 text-sm text-gray-900">{addressData.account?.sequence || '0'}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Balances */}
        {addressData.balances.length > 0 && (
          <div className="bg-white border border-gray-200 text-foreground rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Token Balances ({addressData.balances.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {addressData.balances.map((balance: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700 font-semibold mr-2">{balance.denom.toUpperCase()}</span>
                      <span className="text-xs text-gray-500">{balance.denom}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatTokenAmountWithNetwork(balance.amount, balance.denom.replace('u', '').toUpperCase(), currentNetwork.coinDecimals)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delegations */}
        {delegations.length > 0 && (
          <div className="bg-white border border-gray-200 text-foreground rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">
                Delegations ({delegations.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {delegations.map((delegation: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                    <div>
                      <span className="inline-block px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 font-semibold mr-2">Validator</span>
                      <span className="text-xs text-gray-500 font-mono">
                        {truncateAddress(delegation.delegation?.validator_address || '', 8, 8)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatTokenAmountWithNetwork(delegation.balance?.amount || '0', currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-center py-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </Layout>
  );
}
