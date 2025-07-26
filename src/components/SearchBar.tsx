'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { determineSearchType } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';
import { searchTransactionByHash, searchAddressByAddress } from '@/lib/cosmos-api';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();
  const { currentNetwork } = useNetwork();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setSearchResults(null);
    const searchType = determineSearchType(query.trim());

    try {
      switch (searchType) {
        case 'block':
          router.push(`/blocks/${query.trim()}`);
          break;
        case 'tx':
          // Search for transaction using /cosmos/tx/v1beta1/txs/<hash>
          const txResult = await searchTransactionByHash(currentNetwork, query.trim());
          if (txResult.found) {
            router.push(`/transactions/${query.trim()}`);
          } else {
            setSearchResults(txResult);
            setShowSuggestions(true);
          }
          break;
        case 'address':
          // Search for address using /cosmos/staking/v1beta1/delegations/<address>
          const addressResult = await searchAddressByAddress(currentNetwork, query.trim());
          if (addressResult.found) {
            router.push(`/address/${query.trim()}`);
          } else {
            setSearchResults(addressResult);
            setShowSuggestions(true);
          }
          break;
        default:
          // Try to search as block first, then tx, then address
          router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults({
        found: false,
        error: 'Pencarian gagal. Silakan coba lagi.',
        type: 'error'
      });
      setShowSuggestions(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputFocus = () => {
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false);
      setSearchResults(null);
    }, 200);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults(null);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Cari blok, transaksi, atau alamat..."
          className="w-full md:w-80 px-4 py-2 pl-10 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isLoading}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>
      
      {/* Search suggestions and results */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-w-md">
          {/* Search results */}
          {searchResults && !searchResults.found && (
            <div className="p-3 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-red-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">Tidak ditemukan</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{searchResults.error}</p>
              
              {/* Show endpoint information */}
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                <div className="font-medium text-blue-800">Endpoint yang digunakan:</div>
                {searchResults.type === 'transaction' && (
                  <code className="text-blue-700">/cosmos/tx/v1beta1/txs/{query}</code>
                )}
                {searchResults.type === 'address' && (
                  <code className="text-blue-700">/cosmos/staking/v1beta1/delegations/{query}</code>
                )}
              </div>
            </div>
          )}
          
          {/* Search tips */}
          {query && (
            <div className="p-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs text-gray-500">💡 Tips pencarian:</span>
              </div>
              <ul className="space-y-1 text-xs text-gray-600">
                <li>• <strong>Nomor blok:</strong> contoh "12345"</li>
                <li>• <strong>Hash transaksi:</strong> 64 karakter hex</li>
                <li>• <strong>Alamat:</strong> dimulai dengan "{currentNetwork.chainId.split('-')[0]}"</li>
              </ul>
              
              {/* Show current search type */}
              {query.trim() && (
                <div className="mt-2 p-2 bg-gray-50 rounded">
                  <div className="text-xs font-medium text-gray-700">
                    Tipe pencarian: {determineSearchType(query.trim()) === 'tx' ? 'Transaksi' : 
                                   determineSearchType(query.trim()) === 'address' ? 'Alamat' : 
                                   determineSearchType(query.trim()) === 'block' ? 'Blok' : 'Otomatis'}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {determineSearchType(query.trim()) === 'tx' && 'Menggunakan endpoint: /cosmos/tx/v1beta1/txs/'}
                    {determineSearchType(query.trim()) === 'address' && 'Menggunakan endpoint: /cosmos/staking/v1beta1/delegations/'}
                    {determineSearchType(query.trim()) === 'block' && 'Menggunakan endpoint: /cosmos/base/tendermint/v1beta1/blocks/'}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  );
}
