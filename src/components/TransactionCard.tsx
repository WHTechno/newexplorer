import Link from 'next/link';
import { formatTime, formatTimeAgo, truncateHash, parseTxType, formatTokenAmountWithNetwork } from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

interface TransactionCardProps {
  transaction: {
    txhash: string;
    height: string;
    timestamp: string;
    tx: {
      body: {
        messages: Array<{
          '@type': string;
          [key: string]: any;
        }>;
      };
      auth_info: {
        fee: {
          amount: Array<{
            denom: string;
            amount: string;
          }>;
          gas_limit: string;
        };
      };
    };
    code?: number;
    gas_used: string;
    gas_wanted: string;
  };
}

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const { currentNetwork } = useNetwork();
  const isSuccess = !transaction.code || transaction.code === 0;
  const messageTypes = transaction.tx.body.messages.map(msg => parseTxType(msg['@type']));
  const primaryType = messageTypes[0] || 'Unknown';
  const fee = transaction.tx.auth_info.fee.amount[0];
  const feeAmount = fee ? formatTokenAmountWithNetwork(fee.amount, currentNetwork.coinSymbol, currentNetwork.coinDecimals) : `0 ${currentNetwork.coinSymbol}`;

  return (
    <div className="bg-surface border border-default rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow text-foreground">
      <div className="flex items-center justify-between mb-4 text-foreground">
        <div className="flex items-center space-x-3 text-foreground">
          <div className={`w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-foreground ${isSuccess ? '' : 'bg-red-100'}`}>
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
          <div>
            <Link
              href={`/transactions/${transaction.txhash}`}
              className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
            >
              {primaryType}
            </Link>
            <p className="text-sm text-foreground mt-1">
              {formatTimeAgo(transaction.timestamp)}
            </p>
          </div>
        </div>

        <div className="text-right text-foreground">
          <div className={`text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>{isSuccess ? 'Berhasil' : 'Gagal'}</div>
          <div className="text-xs text-foreground">Block #{transaction.height}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4 text-foreground">
        <div>
          <span className="text-foreground">Hash:</span>
          <div className="font-mono text-foreground">
            {truncateHash(transaction.txhash)}
          </div>
        </div>

        <div>
          <span className="text-foreground">Fee:</span>
          <div className="font-medium text-foreground">{feeAmount}</div>
        </div>

        <div>
          <span className="text-foreground">Gas:</span>
          <div className="font-medium text-foreground">
            {parseInt(transaction.gas_used).toLocaleString()} / {parseInt(transaction.gas_wanted).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Message types */}
      {messageTypes.length > 1 && (
        <div className="mb-4 text-foreground">
          <span className="text-gray-500 text-sm">Messages:</span>
          <div className="flex flex-wrap gap-2 mt-1 text-foreground">
            {messageTypes.map((type, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-100 text-foreground">
        <div className="flex items-center justify-between text-foreground">
          <div className="flex items-center space-x-4 text-sm text-foreground">
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(transaction.timestamp)}
            </span>
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              Block #{transaction.height}
            </span>
          </div>

          <Link
            href={`/transactions/${transaction.txhash}`}
            className="text-foreground hover:text-primary font-medium text-sm transition-colors"
          >
            Lihat Detail →
          </Link>
        </div>
      </div>
    </div>
  );
}
