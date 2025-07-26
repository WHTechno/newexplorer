'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getTransactionByHash } from '@/lib/cosmos-api';
import { formatTime, formatTimeAgo, truncateHash, parseTxType, formatTokenAmountWithNetwork } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

export default function TransactionDetailPage() {
  const { currentNetwork } = useNetwork();
  const params = useParams();
  const router = useRouter();
  const hash = params.hash as string;
  
  const [transaction, setTransaction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hash) {
      fetchTransactionDetail();
    }
  }, [hash, currentNetwork]);

  const fetchTransactionDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if this is a sample transaction hash
      if (hash.startsWith('sample_') || hash.includes('_')) {
        // Create mock transaction data for sample transactions
        const mockTransaction = {
          txhash: hash,
          height: hash.startsWith('sample_') ? 
            (parseInt(hash.split('_')[1]) * 5 + parseInt(hash.split('_')[2]) + 22765000).toString() : 
            hash.split('_')[0],
          timestamp: new Date().toISOString(),
          code: 0,
          gas_used: '150000',
          gas_wanted: '200000',
          tx: {
            body: {
              messages: [{
                '@type': '/cosmos.bank.v1beta1.MsgSend',
                from_address: `${currentNetwork.chainId}1sample_from_address`,
                to_address: `${currentNetwork.chainId}1sample_to_address`,
                amount: [{
                  denom: currentNetwork.coinSymbol.toLowerCase(),
                  amount: '1000000'
                }]
              }]
            },
            auth_info: {
              fee: {
                amount: [{
                  denom: currentNetwork.coinSymbol.toLowerCase(),
                  amount: '5000'
                }],
                gas_limit: '200000'
              }
            }
          }
        };
        setTransaction(mockTransaction);
        return;
      }
      
      // Try to fetch real transaction data
      const txData = await getTransactionByHash(currentNetwork, hash);
      setTransaction(txData);
    } catch (err) {
      console.error('Error fetching transaction detail:', err);
      setError('Failed to load transaction details. Transaction may not be found.');
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
              onClick={fetchTransactionDetail}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/transactions')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Back to Transactions
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!transaction) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">Transaction not found</h3>
        </div>
      </Layout>
    );
  }

  const isSuccess = !transaction.code || transaction.code === 0;
  const messageTypes = transaction.tx?.body?.messages?.map((msg: any) => parseTxType(msg['@type'])) || [];
  const primaryType = messageTypes[0] || 'Unknown';
  const fee = transaction.tx?.auth_info?.fee?.amount?.[0];
  const feeAmount = fee ? formatTokenAmountWithNetwork(fee.amount, currentNetwork.coinSymbol, currentNetwork.coinDecimals) : `0 ${currentNetwork.coinSymbol}`;

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
                Transaction Details
              </h1>
            </div>
            <p className="text-gray-600 mt-1">
              {primaryType} transaction on network {currentNetwork.chainId}
            </p>
          </div>
        </div>

        {/* Endpoint Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Data Source</h3>
              <p className="text-sm text-blue-700 mt-1">
                Transaction details fetched from endpoint: <code className="bg-blue-100 px-1 rounded">/cosmos/tx/v1beta1/txs/{hash}</code>
              </p>
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isSuccess ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {isSuccess ? (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Status</div>
                <div className={`text-2xl font-bold ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                  {isSuccess ? 'Success' : 'Failed'}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Block Height</div>
                <div className="text-2xl font-bold text-gray-900">{transaction.height}</div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Fee</div>
                <div className="text-2xl font-bold text-gray-900">{feeAmount}</div>
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
                <div className="text-sm font-medium text-gray-600">Gas Used</div>
                <div className="text-lg font-bold text-gray-900">
                  {parseInt(transaction.gas_used || '0').toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction Details */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transaction Information</h3>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-600">Transaction Hash</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{transaction.txhash}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Block Height</dt>
                <dd className="mt-1 text-sm text-gray-900">{transaction.height}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Timestamp</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTime(transaction.timestamp)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Gas Used / Wanted</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {parseInt(transaction.gas_used || '0').toLocaleString()} / {parseInt(transaction.gas_wanted || '0').toLocaleString()}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Fee</dt>
                <dd className="mt-1 text-sm text-gray-900">{feeAmount}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Message Count</dt>
                <dd className="mt-1 text-sm text-gray-900">{messageTypes.length}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Messages */}
        {messageTypes.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Messages ({messageTypes.length})
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {transaction.tx.body.messages.map((message: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Message #{index + 1}: {parseTxType(message['@type'])}
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1">
                          {message['@type']}
                        </div>
                      </div>
                    </div>
                    
                    {/* Message Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {message.from_address && (
                        <div>
                          <dt className="text-xs font-medium text-gray-600">From</dt>
                          <dd className="mt-1 text-xs text-gray-900 font-mono break-all">{message.from_address}</dd>
                        </div>
                      )}
                      
                      {message.to_address && (
                        <div>
                          <dt className="text-xs font-medium text-gray-600">To</dt>
                          <dd className="mt-1 text-xs text-gray-900 font-mono break-all">{message.to_address}</dd>
                        </div>
                      )}
                      
                      {message.amount && message.amount.length > 0 && (
                        <div>
                          <dt className="text-xs font-medium text-gray-600">Amount</dt>
                          <dd className="mt-1 text-xs text-gray-900">
                            {message.amount.map((amt: any, i: number) => (
                              <div key={i}>
                                {formatTokenAmountWithNetwork(amt.amount, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                              </div>
                            ))}
                          </dd>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="text-xs font-medium text-gray-600 mb-2">Raw Data:</div>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(message, null, 2)}
                      </pre>
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
            onClick={() => router.push('/transactions')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Transactions
          </button>
        </div>
      </div>
    </Layout>
  );
}
