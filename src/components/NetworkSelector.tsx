'use client';

import { useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';

export default function NetworkSelector() {
  const { currentNetwork, networks, switchNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkChange = (networkId: string) => {
    switchNetwork(networkId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>{currentNetwork.name}</span>
        </div>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          ></div>
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-64 bg-surface text-foreground border border-default rounded-md shadow-lg">
            <div className="py-1">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Select Network
              </div>
              {networks.map((network) => (
                <button
                  key={network.id}
                  onClick={() => handleNetworkChange(network.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-primary transition-colors ${
                    currentNetwork.id === network.id ? 'bg-primary border-r-2 border-primary' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        currentNetwork.id === network.id ? 'bg-primary' : 'bg-gray-300'
                      }`}></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {network.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {network.chainId} • {network.coinSymbol}
                        </div>
                      </div>
                    </div>
                    {currentNetwork.id === network.id && (
                      <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {network.description && (
                    <div className="text-xs text-gray-400 mt-1 ml-5">
                      {network.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-gray-100 px-4 py-3">
              <div className="text-xs text-gray-500">
                <div className="font-medium mb-1">Current Network:</div>
                <div>Chain ID: {currentNetwork.chainId}</div>
                <div>Symbol: {currentNetwork.coinSymbol}</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
