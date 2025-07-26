'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getBlockByHeight } from '@/lib/cosmos-api';
import { formatTime, formatNumber, truncateHash } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

export default function BlockDetailPage() {
  const { currentNetwork } = useNetwork();
  const params = useParams();
  const router = useRouter();
  const height = params.height as string;
  
  const [block, setBlock] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (height) {
      fetchBlockDetail();
    }
  }, [height, currentNetwork]);

  const fetchBlockDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const blockData = await getBlockByHeight(currentNetwork, height);
      setBlock(blockData);
    } catch (err) {
      console.error('Error fetching block detail:', err);
      setError('Gagal memuat detail blok. Blok mungkin tidak ditemukan.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToBlock = (newHeight: number) => {
    if (newHeight > 0) {
      router.push(`/blocks/${newHeight}`);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
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
              onClick={fetchBlockDetail}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push('/blocks')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Kembali ke Blocks
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!block) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">Blok tidak ditemukan</h3>
        </div>
      </Layout>
    );
  }

  const blockHeight = parseInt(block.header.height);
  const txCount = block.data?.txs?.length || 0;

  return (
    <Layout>
      <div className="space-y-6">
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
              <h1 className="text-3xl font-bold text-gray-900">
                Block #{formatNumber(blockHeight)}
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              Detail informasi blok pada height {formatNumber(blockHeight)}
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateToBlock(blockHeight - 1)}
              disabled={blockHeight <= 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Previous Block"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => navigateToBlock(blockHeight + 1)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Next Block"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Height</div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(blockHeight)}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Transactions</div>
                <div className="text-2xl font-bold text-gray-900">{txCount}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Timestamp</div>
                <div className="text-lg font-bold text-gray-900">
                  {new Date(block.header.time).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Chain ID</div>
                <div className="text-lg font-bold text-gray-900">{block.header.chain_id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Block Details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Block Information</h3>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-600">Height</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{formatNumber(blockHeight)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Timestamp</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTime(block.header.time)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Chain ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{block.header.chain_id}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Proposer Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {block.header.proposer_address || 'N/A'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Block Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {block.block_id?.hash || 'N/A'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Previous Block Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {block.header.last_block_id?.hash || 'N/A'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Data Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {block.header.data_hash || 'N/A'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Validators Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">
                  {block.header.validators_hash || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Transactions */}
        {txCount > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Transactions ({txCount})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {block.data.txs.map((tx: string, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Transaction #{index + 1}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {truncateHash(tx, 16)}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        Raw transaction data
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex justify-between items-center py-6">
          <button
            onClick={() => navigateToBlock(blockHeight - 1)}
            disabled={blockHeight <= 1}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous Block
          </button>
          
          <button
            onClick={() => router.push('/blocks')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            All Blocks
          </button>
          
          <button
            onClick={() => navigateToBlock(blockHeight + 1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Next Block
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </Layout>
  );
}
