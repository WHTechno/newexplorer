'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import GlobalStatsCard from '@/components/GlobalStatsCard';
import BlockCard from '@/components/BlockCard';
import TransactionCard from '@/components/TransactionCard';
import { 
  getChainInfo, 
  getBlocks, 
  getRecentTransactions, 
  checkEndpointHealth 
} from '@/lib/cosmos-api';
import { formatNumber, formatTimeAgo } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

interface ChainInfo {
  latestBlockHeight: string;
  chainId: string;
  validatorCount: number;
  latestBlockTime: string;
}

interface EndpointHealth {
  rpc: boolean;
  lcd: boolean;
}

export default function Dashboard() {
  const { currentNetwork } = useNetwork();
  const [chainInfo, setChainInfo] = useState<ChainInfo | null>(null);
  const [recentBlocks, setRecentBlocks] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [endpointHealth, setEndpointHealth] = useState<EndpointHealth>({ rpc: false, lcd: false });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [currentNetwork]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      
      // Fetch all data in parallel
      const [chainData, blocksData, transactionsData, healthData] = await Promise.allSettled([
        getChainInfo(currentNetwork),
        getBlocks(currentNetwork, 1, 5),
        getRecentTransactions(currentNetwork, 5),
        checkEndpointHealth(currentNetwork)
      ]);

      // Handle chain info
      if (chainData.status === 'fulfilled') {
        setChainInfo(chainData.value);
      } else {
        console.error('Failed to fetch chain info:', chainData.reason);
      }

      // Handle blocks
      if (blocksData.status === 'fulfilled') {
        setRecentBlocks(blocksData.value);
      } else {
        console.error('Failed to fetch blocks:', blocksData.reason);
      }

      // Handle transactions
      if (transactionsData.status === 'fulfilled') {
        setRecentTransactions(transactionsData.value);
      } else {
        console.error('Failed to fetch transactions:', transactionsData.reason);
      }

      // Handle health check
      if (healthData.status === 'fulfilled') {
        setEndpointHealth(healthData.value);
      } else {
        console.error('Failed to check endpoint health:', healthData.reason);
      }

    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getHealthStatus = () => {
    if (endpointHealth.rpc && endpointHealth.lcd) return 'success';
    if (endpointHealth.rpc || endpointHealth.lcd) return 'warning';
    return 'error';
  };

  const getHealthText = () => {
    if (endpointHealth.rpc && endpointHealth.lcd) return 'Semua endpoint aktif';
    if (endpointHealth.rpc || endpointHealth.lcd) return 'Sebagian endpoint aktif';
    return 'Endpoint tidak aktif';
  };

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 mt-1">
              Cosmos SDK Blockchain Explorer untuk {currentNetwork.chainId}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {chainInfo && (
              <span>Terakhir diperbarui: {formatTimeAgo(chainInfo.latestBlockTime)}</span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <GlobalStatsCard
            title="Latest Block Height"
            value={chainInfo ? formatNumber(parseInt(chainInfo.latestBlockHeight)) : '-'}
            subtitle={chainInfo ? `Chain: ${chainInfo.chainId}` : undefined}
            isLoading={isLoading}
          />
          
          <GlobalStatsCard
            title="Active Validators"
            value={chainInfo ? formatNumber(chainInfo.validatorCount) : '-'}
            subtitle="Validator nodes"
            isLoading={isLoading}
          />
          
          <GlobalStatsCard
            title="Network Status"
            value={getHealthText()}
            status={getHealthStatus()}
            subtitle={`RPC: ${endpointHealth.rpc ? 'Online' : 'Offline'}, LCD: ${endpointHealth.lcd ? 'Online' : 'Offline'}`}
            isLoading={isLoading}
          />
          
          <GlobalStatsCard
            title="Recent Blocks"
            value={recentBlocks.length}
            subtitle="Last 5 blocks"
            isLoading={isLoading}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Blocks */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Blocks</h2>
              <a 
                href="/blocks" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Lihat Semua →
              </a>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentBlocks.length > 0 ? (
                recentBlocks.slice(0, 3).map((block, index) => (
                  <BlockCard key={`${block.header.height}-${index}`} block={block} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada blok yang ditemukan
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
              <a 
                href="/transactions" 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
              >
                Lihat Semua →
              </a>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.slice(0, 3).map((tx, index) => (
                  <TransactionCard key={`${tx.txhash}-${index}`} transaction={tx} />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada transaksi yang ditemukan
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="/blocks"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Explore Blocks</div>
                <div className="text-sm text-gray-500">Browse blockchain blocks</div>
              </div>
            </a>

            <a 
              href="/transactions"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">View Transactions</div>
                <div className="text-sm text-gray-500">Browse network transactions</div>
              </div>
            </a>

            <a 
              href="/validators"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-gray-900">Check Validators</div>
                <div className="text-sm text-gray-500">View network validators</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
