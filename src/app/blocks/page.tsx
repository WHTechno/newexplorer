'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import BlockCard from '@/components/BlockCard';
import { getBlockByHeight } from '@/lib/cosmos-api';
import { base64ToHex } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

export default function BlocksPage() {
  const { currentNetwork } = useNetwork();
  const [blocks, setBlocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const totalPages = total ? Math.ceil(total / limit) : page;
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchBlocks(1, true);
    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchBlocks(1, true);
    }, 30000);
    return () => clearInterval(interval);
  }, [currentNetwork]);

  const fetchBlocks = async (pageNum: number, reset = false, customLimit?: number) => {
    try {
      if (reset) {
        setIsLoading(true);
        setError(null);
      } else {
        setIsLoadingMore(true);
      }

      const latestBlock = await getBlockByHeight(currentNetwork, 'latest');
      const latestHeight = parseInt(latestBlock.header.height);
      const useLimit = customLimit || limit;
      const startHeight = Math.max(1, latestHeight - (pageNum - 1) * useLimit);
      const endHeight = Math.max(1, startHeight - useLimit + 1);
      setTotal(latestHeight);

      const blocks: any[] = [];
      for (let height = startHeight; height >= endHeight; height--) {
        try {
          const block = await getBlockByHeight(currentNetwork, height.toString());
          blocks.push({ ...block, hash: block.block_id?.hash ? base64ToHex(block.block_id.hash).toUpperCase() : '' });
        } catch (error) {
          console.error(`Error fetching block ${height}:`, error);
        }
      }

      setBlocks(blocks);
      setHasMore(startHeight > 1);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching blocks:', err);
      setError('Failed to load blocks. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handlePrev = () => {
    if (page > 1) fetchBlocks(page - 1);
  };
  const handleNext = () => {
    if (hasMore) fetchBlocks(page + 1);
  };
  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    fetchBlocks(1, true, Number(e.target.value));
  };
  const goFirst = () => {
    fetchBlocks(1, true, limit);
  };
  const goLast = () => {
    if (totalPages > 1) {
      fetchBlocks(totalPages, true, limit);
    }
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchBlocks(nextPage, false);
    }
  };

  const refresh = () => {
    setPage(1);
    fetchBlocks(1, true);
  };

  return (
    <Layout>
      <div className="space-y-6 bg-background min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blocks</h1>
            <p className="text-foreground mt-1">
              Latest blocks on network {currentNetwork.chainId}
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={refresh}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-default text-foreground rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Total Blocks Loaded</div>
                <div className="text-2xl font-bold text-foreground">{blocks.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default text-foreground rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Latest Block</div>
                <div className="text-2xl font-bold text-foreground">
                  {blocks.length > 0 ? `#${parseInt(blocks[0].header.height).toLocaleString()}` : '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default text-foreground rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Total Transactions</div>
                <div className="text-2xl font-bold text-foreground">
                  {blocks.reduce((total, block) => total + (block.data?.txs?.length || 0), 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blocks List */}
        <div className="space-y-4">
          {isLoading && blocks.length === 0 ? (
            // Loading skeleton
            [...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface border border-default text-foreground rounded-lg p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : blocks.length > 0 ? (
            blocks.map((block, index) => (
              <BlockCard key={`${block.header.height}-${index}`} block={block} />
            ))
          ) : !isLoading && (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-foreground">No blocks</h3>
              <p className="mt-1 text-sm text-foreground">
                No blocks found.
              </p>
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && blocks.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center px-6 py-3 border border-default rounded-md shadow-sm text-sm font-medium text-foreground bg-surface hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full"></div>
                  Memuat...
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
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-2">
          <div className="flex items-center gap-2">
            <span>Show rows:</span>
            <select value={limit} onChange={handleLimitChange} className="border rounded px-2 py-1">
              {[10, 15, 25, 50, 100].map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={goFirst} disabled={page === 1} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">First</button>
            <button onClick={handlePrev} disabled={page === 1} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={handleNext} disabled={!hasMore} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Next</button>
            <button onClick={goLast} disabled={page === totalPages} className="px-2 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50">Last</button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
