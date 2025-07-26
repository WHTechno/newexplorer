'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { getValidatorByAddress } from '@/lib/cosmos-api';
import { 
  formatTokenAmountWithNetwork, 
  truncateAddress, 
  formatPercentage,
  getValidatorStatusColor,
  getValidatorStatusText,
  formatTime
} from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

export default function ValidatorDetailPage() {
  const { currentNetwork } = useNetwork();
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;
  
  const [validator, setValidator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (address) {
      fetchValidatorDetail();
    }
  }, [address, currentNetwork]);

  const fetchValidatorDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const validatorData = await getValidatorByAddress(currentNetwork, address);
      setValidator(validatorData);
    } catch (err) {
      console.error('Error fetching validator detail:', err);
      setError('Gagal memuat detail validator. Validator mungkin tidak ditemukan.');
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
              onClick={fetchValidatorDetail}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Coba Lagi
            </button>
            <button
              onClick={() => router.push('/validators')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Kembali ke Validators
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!validator) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h3 className="text-sm font-medium text-gray-900">Validator tidak ditemukan</h3>
        </div>
      </Layout>
    );
  }

  const commission = parseFloat(validator.commission.commission_rates.rate) * 100;
  const maxCommission = parseFloat(validator.commission.commission_rates.max_rate) * 100;
  const statusColor = getValidatorStatusColor(validator.status);
  const statusText = getValidatorStatusText(validator.status);

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
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0 h-16 w-16">
                  {validator.profilePicture ? (
                    <img
                      src={validator.profilePicture}
                      alt={validator.description.moniker}
                      className="h-16 w-16 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={`h-16 w-16 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ${
                      validator.profilePicture ? 'hidden' : 'flex'
                    }`}
                  >
                    <span className="text-white font-bold text-xl">
                      {validator.description.moniker.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {validator.description.moniker}
                  </h1>
                  <p className="text-gray-600 mt-1 font-mono text-sm">
                    {truncateAddress(validator.operator_address, 12, 12)}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
              {validator.jailed && (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
              {validator.jailed ? 'Jailed' : statusText}
            </span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Voting Power</div>
                <div className="text-2xl font-bold text-blue-600">
                  {formatTokenAmountWithNetwork(validator.tokens, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Commission</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatPercentage(commission, 2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Delegator Shares</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatTokenAmountWithNetwork(validator.delegator_shares, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-600">Self Delegation</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatTokenAmountWithNetwork(validator.min_self_delegation, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validator Information */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Validator Information</h3>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-600">Moniker</dt>
                <dd className="mt-1 text-sm text-gray-900">{validator.description.moniker}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Operator Address</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono break-all">{validator.operator_address}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                    {statusText}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Jailed</dt>
                <dd className="mt-1 text-sm text-gray-900">{validator.jailed ? 'Yes' : 'No'}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Commission Rate</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatPercentage(commission, 2)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Max Commission</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatPercentage(maxCommission, 2)}</dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-gray-600">Commission Update Time</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatTime(validator.commission.update_time)}</dd>
              </div>
              
              {validator.description.identity && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Keybase Identity</dt>
                  <dd className="mt-1 text-sm text-blue-600">{validator.description.identity}</dd>
                </div>
              )}
              
              {validator.description.website && (
                <div>
                  <dt className="text-sm font-medium text-gray-600">Website</dt>
                  <dd className="mt-1 text-sm text-blue-600">
                    <a href={validator.description.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {validator.description.website}
                    </a>
                  </dd>
                </div>
              )}
              
              {validator.description.details && (
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-gray-600">Details</dt>
                  <dd className="mt-1 text-sm text-gray-900">{validator.description.details}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-center py-6">
          <button
            onClick={() => router.push('/validators')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Back to Validators
          </button>
        </div>
      </div>
    </Layout>
  );
}
