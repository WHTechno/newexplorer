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
        const txData = transactionsData.value;
        setRecentTransactions(txData.transactions || txData || []);
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
      <div className="space-y-6 bg-background min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-foreground mt-1">
              Cosmos SDK Blockchain Explorer for {currentNetwork.chainId}
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-default rounded-md shadow-sm text-sm font-medium text-foreground bg-surface hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className={`-ml-1 mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-300">Error</h3>
                <p className="text-sm text-red-200 mt-1">{error}</p>
                <button
                  onClick={fetchDashboardData}
                  className="mt-2 text-sm text-red-300 underline hover:text-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Latest Block Height</div>
                <div className="text-2xl font-bold text-blue-600">
                  {chainInfo ? formatNumber(parseInt(chainInfo.latestBlockHeight)) : '-'}
                </div>
                {chainInfo && (
                  <div className="text-xs text-foreground">Chain: {chainInfo.chainId}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Active Validators</div>
                <div className="text-2xl font-bold text-green-600">
                  {chainInfo ? formatNumber(chainInfo.validatorCount) : '-'}
                </div>
                <div className="text-xs text-foreground">Validator nodes</div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                getHealthStatus() === 'success' ? 'bg-green-100' : 
                getHealthStatus() === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  getHealthStatus() === 'success' ? 'text-green-600' : 
                  getHealthStatus() === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Network Status</div>
                <div className={`text-2xl font-bold ${
                  getHealthStatus() === 'success' ? 'text-green-600' : 
                  getHealthStatus() === 'warning' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getHealthText()}
                </div>
                <div className="text-xs text-foreground">
                  RPC: {endpointHealth.rpc ? 'Online' : 'Offline'}, LCD: {endpointHealth.lcd ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Recent Blocks</div>
                <div className="text-2xl font-bold text-purple-600">{recentBlocks.length}</div>
                <div className="text-xs text-foreground">Last 5 blocks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Blocks */}
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Blocks</h2>
              <a 
                href="/blocks" 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Lihat Semua →
              </a>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-background border border-default rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentBlocks.length > 0 ? (
                recentBlocks.slice(0, 3).map((block, index) => (
                  <BlockCard key={`${block.header.height}-${index}`} block={block} />
                ))
              ) : (
                <div className="text-center py-8 text-foreground">
                  Tidak ada blok yang ditemukan
                </div>
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-foreground">Recent Transactions</h2>
              <a 
                href="/transactions" 
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                Lihat Semua →
              </a>
            </div>
            
            <div className="space-y-4">
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="bg-background border border-default rounded-lg p-6 animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recentTransactions.length > 0 ? (
                recentTransactions.slice(0, 3).map((tx, index) => (
                  <TransactionCard key={`${tx.txhash}-${index}`} transaction={tx} />
                ))
              ) : (
                <div className="text-center py-8 text-foreground">
                  Tidak ada transaksi yang ditemukan
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-surface border border-default rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a 
              href="/blocks"
              className="flex items-center p-4 border border-default rounded-lg hover:bg-primary/20 transition-colors bg-background"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-foreground">Explore Blocks</div>
                <div className="text-sm text-secondary">Browse blockchain blocks</div>
              </div>
            </a>

            <a 
              href="/transactions"
              className="flex items-center p-4 border border-default rounded-lg hover:bg-primary/20 transition-colors bg-background"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-foreground">View Transactions</div>
                <div className="text-sm text-secondary">Browse network transactions</div>
              </div>
            </a>

            <a 
              href="/validators"
              className="flex items-center p-4 border border-default rounded-lg hover:bg-primary/20 transition-colors bg-background"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-foreground">Check Validators</div>
                <div className="text-sm text-secondary">View network validators</div>
              </div>
            </a>

            <a 
              href="/uptime"
              className="flex items-center p-4 border border-default rounded-lg hover:bg-primary/20 transition-colors bg-background"
            >
              <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="font-medium text-foreground">Validator Uptime</div>
                <div className="text-sm text-secondary">Monitor validator performance</div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}
