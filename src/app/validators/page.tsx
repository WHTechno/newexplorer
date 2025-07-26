'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ValidatorTable from '@/components/ValidatorTable';
import { getAllValidators } from '@/lib/cosmos-api';
import { formatNumber, formatPercentage } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

export default function ValidatorsPage() {
  const { currentNetwork } = useNetwork();
  const [validators, setValidators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'jailed'>('all');
  const [sortBy, setSortBy] = useState<'voting_power' | 'commission' | 'name'>('voting_power');

  useEffect(() => {
    fetchValidators();
    // Auto-refresh setiap 30 detik
    const interval = setInterval(() => {
      fetchValidators();
    }, 30000);
    return () => clearInterval(interval);
  }, [currentNetwork]);

  const fetchValidators = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const validatorsData = await getAllValidators(currentNetwork);
      setValidators(validatorsData);
    } catch (err) {
      console.error('Error fetching validators:', err);
      setError('Failed to load validators. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    fetchValidators();
  };

  // Filter validators based on selected filter
  const filteredValidators = validators.filter(validator => {
    switch (filter) {
      case 'active':
        return validator.status === 'BOND_STATUS_BONDED' && !validator.jailed;
      case 'inactive':
        return validator.status !== 'BOND_STATUS_BONDED' && !validator.jailed;
      case 'jailed':
        return validator.jailed;
      default:
        return true;
    }
  });

  // Sort validators
  const sortedValidators = [...filteredValidators].sort((a, b) => {
    switch (sortBy) {
      case 'voting_power':
        return parseFloat(b.tokens) - parseFloat(a.tokens);
      case 'commission':
        return parseFloat(a.commission.commission_rates.rate) - parseFloat(b.commission.commission_rates.rate);
      case 'name':
        return a.description.moniker.localeCompare(b.description.moniker);
      default:
        return 0;
    }
  });

  // Calculate stats
  const activeValidators = validators.filter(v => v.status === 'BOND_STATUS_BONDED' && !v.jailed);
  const jailedValidators = validators.filter(v => v.jailed);
  const totalStaked = validators.reduce((total, v) => total + parseFloat(v.tokens), 0);
  const averageCommission = validators.length > 0 
    ? validators.reduce((total, v) => total + parseFloat(v.commission.commission_rates.rate), 0) / validators.length * 100
    : 0;

  return (
    <Layout>
      <div className="space-y-6 bg-background min-h-screen pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Validators</h1>
            <p className="text-foreground mt-1">
              Validators on network {currentNetwork.chainId}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-foreground">Jailed Validators</div>
                <div className="text-2xl font-bold text-red-600">{jailedValidators.length}</div>
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
                <div className="text-sm font-medium text-foreground">Avg Commission</div>
                <div className="text-2xl font-bold text-purple-600">
                  {formatPercentage(averageCommission, 1)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-surface border border-default rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-foreground">Filter:</label>
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="bg-surface text-foreground border border-default rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All ({validators.length})</option>
                  <option value="active">Active ({activeValidators.length})</option>
                  <option value="inactive">Inactive ({validators.length - activeValidators.length - jailedValidators.length})</option>
                  <option value="jailed">Jailed ({jailedValidators.length})</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-foreground">Sort by:</label>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-surface text-foreground border border-default rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="voting_power">Voting Power</option>
                  <option value="commission">Commission</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>

            <div className="text-sm text-foreground bg-surface border border-default px-4 py-2 rounded">
              Showing {sortedValidators.length} of {validators.length} validators
            </div>
          </div>
        </div>

        {/* Network Overview */}
        <div className="bg-surface border border-default rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Network Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-foreground">Total Staked</div>
              <div className="text-2xl font-bold text-foreground">
                {formatNumber(Math.floor(totalStaked / Math.pow(10, currentNetwork.coinDecimals)))} {currentNetwork.coinSymbol}
              </div>
              <div className="text-sm text-foreground">
                {formatNumber(totalStaked)} u{currentNetwork.coinSymbol.toLowerCase()}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-foreground">Bonded Ratio</div>
              <div className="text-2xl font-bold text-foreground">
                {formatPercentage((activeValidators.length / validators.length) * 100, 1)}
              </div>
              <div className="text-sm text-foreground">
                {activeValidators.length} of {validators.length} validators
              </div>
            </div>
            
            <div>
              <div className="text-sm text-foreground">Average Commission</div>
              <div className="text-2xl font-bold text-foreground">
                {formatPercentage(averageCommission, 2)}
              </div>
              <div className="text-sm text-foreground">
                Across all validators
              </div>
            </div>
          </div>
        </div>

        {/* Validators Table */}
        <ValidatorTable 
          validators={sortedValidators} 
          totalTokens={totalStaked.toString()}
          isLoading={isLoading}
        />

        {/* Additional Info */}
        <div className="bg-surface border border-default rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-foreground">About Validators</h3>
              <div className="text-sm text-foreground mt-1">
                <p>A validator is a node that participates in the consensus of the network. They validate transactions and secure the network.</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li><strong>Active:</strong> Validator that is currently participating in consensus</li>
                  <li><strong>Inactive:</strong> Validator that is not participating in consensus</li>
                  <li><strong>Jailed:</strong> Validator that has been penalized for misconduct</li>
                  <li><strong>Commission:</strong> Percentage of rewards taken by validator from delegator</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
