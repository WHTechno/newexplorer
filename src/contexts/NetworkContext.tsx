'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Network, NETWORKS, DEFAULT_NETWORK, getNetworkById } from '@/lib/networks';

interface NetworkContextType {
  currentNetwork: Network;
  setCurrentNetwork: (network: Network) => void;
  networks: Network[];
  switchNetwork: (networkId: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [currentNetwork, setCurrentNetwork] = useState<Network>(DEFAULT_NETWORK);

  // Load saved network from localStorage on mount
  useEffect(() => {
    const savedNetworkId = localStorage.getItem('selectedNetwork');
    if (savedNetworkId) {
      const network = getNetworkById(savedNetworkId);
      if (network) {
        setCurrentNetwork(network);
      }
    }
  }, []);

  // Save network to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('selectedNetwork', currentNetwork.id);
  }, [currentNetwork]);

  const switchNetwork = (networkId: string) => {
    const network = getNetworkById(networkId);
    if (network) {
      setCurrentNetwork(network);
    }
  };

  const value: NetworkContextType = {
    currentNetwork,
    setCurrentNetwork,
    networks: NETWORKS,
    switchNetwork,
  };

  return (
    <NetworkContext.Provider value={value}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
