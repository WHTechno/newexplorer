'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import TransactionCard from '@/components/TransactionCard';
import { getLatestBlock, getTransactions } from '@/lib/cosmos-api';
import { useNetwork } from '@/contexts/NetworkContext';
import { formatTime } from '@/lib/utils';

export default function TransactionsPage() {
  const { currentNetwork } = useNetwork();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [latestBlock, setLatestBlock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const blocksPerPage = 5;

  useEffect(() => {
    fetchTransactions(1);
    const interval = setInterval(() => {
      fetchTransactions(1);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentNetwork]);

  const fetchTransactions = async (page: number = 1, append: boolean = false) => {
    try {
      if (!append) {
        setIsLoading(true);
        setError(null);
        setTransactions([]);
      } else {
        setIsLoadingMore(true);
      }

      // Ambil transaksi asli dari API
      const { transactions } = await getTransactions(currentNetwork, blocksPerPage, undefined);
      if (append) {
        setTransactions(prev => [...prev, ...transactions]);
      } else {
        setTransactions(transactions);
      }
      setCurrentPage(page);
      
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !isLoading && !isLoadingMore) {
      fetchTransactions(page);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !isLoading && !isLoadingMore) {
      fetchTransactions(currentPage + 1, true);
    }
  };

  const refresh = () => {
    setCurrentPage(1);
    fetchTransactions(1);
  };

  const successfulTxs = transactions.filter((tx: any) => !tx.code || tx.code === 0).length;
  const failedTxs = transactions.length - successfulTxs;
  const totalFees = transactions.reduce((total: number, tx: any) => {
    const fee = tx.tx?.auth_info?.fee?.amount?.[0];
    return total + (fee ? parseFloat(fee.amount) : 0);
  }, 0);

  return (
    <Layout>
      <div className="space-y-6 bg-background min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-foreground mt-1">
              Latest transactions on network {currentNetwork.chainId}
            </p>
          </div>
          <button
            onClick={refresh}
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
                  onClick={refresh}
                  className="mt-2 text-sm text-red-300 underline hover:text-red-200"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Latest Block Info */}
        {latestBlock && (
          <div className="bg-surface border border-default rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">Latest Block</h2>
                <p className="text-foreground mt-1">
                  Data from endpoint: /cosmos/base/tendermint/v1beta1/blocks/latest
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-foreground">Chain ID</div>
                <div className="text-lg font-bold text-foreground">{latestBlock.header.chain_id}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-foreground">Block Number</div>
                  <div className="text-2xl font-bold text-foreground">{latestBlock.header.height}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-foreground">Block Time</div>
                  <div className="text-lg font-bold text-foreground">{formatTime(latestBlock.header.time)}</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-foreground">Transactions</div>
                  <div className="text-2xl font-bold text-foreground">{latestBlock.data?.txs?.length || 0}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Total Transactions</div>
                <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Successful</div>
                <div className="text-2xl font-bold text-green-600">{successfulTxs}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Failed</div>
                <div className="text-2xl font-bold text-red-600">{failedTxs}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Total Fees</div>
                <div className="text-2xl font-bold text-purple-600">
                  {(totalFees / Math.pow(10, currentNetwork.coinDecimals)).toFixed(2)} {currentNetwork.coinSymbol}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-surface border border-default rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-default">
            <h3 className="text-lg font-semibold text-foreground">Transaction List</h3>
            <p className="text-sm text-foreground mt-1">
              Page {currentPage} of {totalPages} ({transactions.length} transactions displayed)
            </p>
          </div>
          
          <div className="divide-y divide-default">
            {isLoading && transactions.length === 0 ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-gray-700 rounded w-20 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-3 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <div key={`${transaction.txhash}-${index}`} className="p-6">
                  <TransactionCard transaction={transaction} />
                </div>
              ))
            ) : !isLoading && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-foreground">No transactions</h3>
                <p className="mt-1 text-sm text-foreground">
                  No transactions in the latest block.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Load More Button */}
        {currentPage < totalPages && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center px-6 py-3 border border-default rounded-md shadow-sm text-sm font-medium text-foreground bg-surface hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  Loading...
                </>
              ) : (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Load More
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
