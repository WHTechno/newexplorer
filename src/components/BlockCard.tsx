import Link from 'next/link';
import { formatTime, formatTimeAgo, formatNumber, truncateHash, base64ToHex } from '@/lib/utils';

interface BlockCardProps {
  block: {
    header: {
      height: string;
      time: string;
      proposer_address: string;
      chain_id: string;
    };
    data?: {
      txs?: string[];
    };
    hash: string;
  };
}

export default function BlockCard({ block }: BlockCardProps) {
  const txCount = block.data?.txs?.length || 0;
  const height = parseInt(block.header.height);

  return (
    <div className="bg-surface border border-default rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-foreground">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
            </svg>
          </div>
          <div>
            <Link 
              href={`/blocks/${height}`}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              Block #{formatNumber(height)}
            </Link>
            <p className="text-sm text-foreground">
              {formatTimeAgo(block.header.time)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm font-medium text-foreground">
            {txCount} Transaksi
          </div>
          <div className="text-xs text-foreground">
            {formatTime(block.header.time)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-foreground">Height:</span>
          <div className="font-medium text-foreground">{formatNumber(height)}</div>
          <span className="text-foreground">Hash (hex):</span>
          <div className="font-mono text-foreground">{base64ToHex(block.hash)}</div>
          <span className="text-foreground">Hash (base64):</span>
          <div className="font-mono text-foreground">{block.hash}</div>
        </div>
        
        <div>
          <span className="text-foreground">Proposer:</span>
          <div className="font-mono text-foreground">
            {truncateHash(block.header.proposer_address, 6)}
          </div>
        </div>
        
        <div>
          <span className="text-foreground">Chain ID:</span>
          <div className="font-medium text-foreground">{block.header.chain_id}</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-foreground">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(block.header.time)}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {txCount} tx
            </span>
          </div>
          
          <Link 
            href={`/blocks/${height}`}
            className="text-foreground hover:text-primary font-medium text-sm transition-colors"
          >
            Lihat Detail →
          </Link>
        </div>
      </div>
    </div>
  );
}
