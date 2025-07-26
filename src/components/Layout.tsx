'use client';

import Link from 'next/link';
import { useState } from 'react';
import SearchBar from './SearchBar';
import NetworkSelector from './NetworkSelector';
import { useNetwork } from '@/contexts/NetworkContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentNetwork } = useNetwork();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-foreground">
                Cosmos Explorer
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link 
                href="/" 
                className="text-foreground font-bold hover:bg-primary/20 hover:text-foreground px-3 py-2 rounded-md text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/blocks" 
                className="text-foreground font-bold hover:bg-primary/20 hover:text-foreground px-3 py-2 rounded-md text-sm transition-colors"
              >
                Blocks
              </Link>
              <Link 
                href="/transactions" 
                className="text-foreground font-bold hover:bg-primary/20 hover:text-foreground px-3 py-2 rounded-md text-sm transition-colors"
              >
                Transactions
              </Link>
              <Link 
                href="/validators" 
                className="text-foreground font-bold hover:bg-primary/20 hover:text-foreground px-3 py-2 rounded-md text-sm transition-colors"
              >
                Validators
              </Link>
              <Link 
                href="/uptime" 
                className="text-foreground font-bold hover:bg-primary/20 hover:text-foreground px-3 py-2 rounded-md text-sm transition-colors"
              >
                Uptime
              </Link>
            </nav>

            {/* Right side - Network Selector and Search */}
            <div className="hidden md:flex items-center space-x-4">
              <NetworkSelector />
              <SearchBar />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-gray-900 p-2"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/blocks" 
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blocks
                </Link>
                <Link 
                  href="/transactions" 
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Transactions
                </Link>
                <Link 
                  href="/validators" 
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Validators
                </Link>
                <Link 
                  href="/uptime" 
                  className="text-gray-700 hover:text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Uptime
                </Link>
              </div>
              <div className="px-4 py-3 space-y-3">
                <NetworkSelector />
                <SearchBar />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-default text-secondary text-sm py-4 mt-8 w-full text-center">
        © 2024 Cosmos Explorer. Built for oro_1336-1
      </footer>
    </div>
  );
}
