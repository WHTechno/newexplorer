'use client';

import Link from 'next/link';
import { useState } from 'react';
import SearchBar from './SearchBar';
import NetworkSelector from './NetworkSelector';
import { useNetwork } from '@/contexts/NetworkContext';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { currentNetwork } = useNetwork();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/blocks', label: 'Blocks' },
    { href: '/transactions', label: 'Transactions' },
    { href: '/validators', label: 'Validators' },
    { href: '/uptime', label: 'Uptime' },
  ];

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Header */}
      <header className="bg-surface/80 backdrop-blur-md shadow-lg border-b border-default sticky top-0 z-30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2 text-2xl font-extrabold tracking-tight text-foreground drop-shadow-sm">
                <img src="/window.svg" alt="Logo" className="w-7 h-7 animate-pulse" />
                <span>WHTech</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-2 lg:space-x-6">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative font-semibold px-3 py-2 rounded-md text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 group
                      ${isActive ? 'text-primary underline underline-offset-8 decoration-2' : 'text-foreground hover:text-primary'}
                    `}
                  >
                    <span className={isActive ? '' : 'group-hover:underline group-hover:underline-offset-8 transition-all'}>{link.label}</span>
                  </Link>
                );
              })}
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
                className="text-foreground hover:text-primary p-2 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-md"
                aria-label="Open menu"
              >
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-surface/95 backdrop-blur-md rounded-b-xl shadow-lg border-t border-default animate-fade-in">
              <div className="px-4 pt-4 pb-2 space-y-2">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`block font-semibold px-3 py-2 rounded-md text-base transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40
                        ${isActive ? 'text-primary bg-primary/10 underline underline-offset-8 decoration-2' : 'text-foreground hover:bg-primary/10 hover:text-primary'}
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
              <div className="px-4 py-3 space-y-3 border-t border-default">
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
