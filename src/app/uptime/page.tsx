'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ValidatorUptime from '@/components/ValidatorUptime';
import { useNetwork } from '@/contexts/NetworkContext';
import { getAllValidators } from '@/lib/cosmos-api';

export default function UptimePage() {
  const { currentNetwork } = useNetwork();
  const [validators, setValidators] = useState<any[]>([]);
  const [selectedValidator, setSelectedValidator] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchValidators();
  }, [currentNetwork]);

  const fetchValidators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const validatorsData = await getAllValidators(currentNetwork);
      setValidators(validatorsData);
      
      // Select first active validator by default
      const activeValidator = validatorsData.find(v => 
        v.status === 'BOND_STATUS_BONDED' && !v.jailed
      );
      if (activeValidator) {
        setSelectedValidator(activeValidator);
      }
    } catch (err) {
      console.error('Error fetching validators:', err);
      setError('Failed to load validators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredValidators = validators.filter(validator =>
    validator.description.moniker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    validator.operator_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeValidators = validators.filter(v => v.status === 'BOND_STATUS_BONDED' && !v.jailed);

  return (
    <Layout>
      <div className="space-y-6 bg-background min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Validator Uptime</h1>
            <p className="text-foreground mt-1">
              Monitor validator uptime and block signing performance on {currentNetwork.chainId}
            </p>
          </div>
          <button
            onClick={fetchValidators}
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
                  onClick={fetchValidators}
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
          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Active Validators</div>
                <div className="text-2xl font-bold text-green-600">{activeValidators.length}</div>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-default rounded-lg p-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Total Validators</div>
                <div className="text-2xl font-bold text-blue-600">{validators.length}</div>
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
                <div className="text-sm font-medium text-foreground">Network</div>
                <div className="text-2xl font-bold text-purple-600">{currentNetwork.name}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Validator Selection */}
        <div className="bg-surface border border-default rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Select Validator</h3>
          
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search validators by name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-default rounded-lg text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Validator List */}
          <div className="max-h-60 overflow-y-auto space-y-2">
            {filteredValidators.map((validator) => (
              <div
                key={validator.operator_address}
                onClick={() => setSelectedValidator(validator)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedValidator?.operator_address === validator.operator_address
                    ? 'bg-blue-100 border-blue-300'
                    : 'bg-background hover:bg-primary/10 border-default'
                } border`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">
                      {validator.description.moniker}
                    </div>
                    <div className="text-sm text-gray-500 truncate">
                      {validator.operator_address}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {validator.status === 'BOND_STATUS_BONDED' && !validator.jailed && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                    )}
                    {validator.jailed && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        Jailed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime Display */}
        {selectedValidator && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Uptime Monitor</h3>
            <ValidatorUptime
              validatorName={selectedValidator.description.moniker}
              restEndpoint={currentNetwork.lcdEndpoint}
              validatorOperatorAddress={selectedValidator.operator_address}
              blockCount={100}
            />
          </div>
        )}

        {/* Info */}
        <div className="bg-surface border border-default rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-foreground">About Validator Uptime</h3>
              <div className="text-sm text-foreground mt-1">
                <p>Validator uptime shows the percentage of blocks a validator has successfully signed in recent history.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Green blocks:</strong> Successfully signed blocks</li>
                  <li><strong>Red blocks:</strong> Missed blocks (validator was offline or failed to sign)</li>
                  <li><strong>Uptime percentage:</strong> Ratio of signed blocks to total blocks</li>
                  <li>Data is fetched from the slashing module's signing info endpoint</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
