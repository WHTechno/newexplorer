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
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isSuccess ? 'bg-green-100' : 'bg-red-100'
          }`}>
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
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
            >
              {primaryType}
            </Link>
            <p className="text-sm text-gray-500">
              {formatTimeAgo(transaction.timestamp)}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isSuccess ? 'text-green-600' : 'text-red-600'
          }`}>
            {isSuccess ? 'Berhasil' : 'Gagal'}
          </div>
          <div className="text-xs text-gray-500">
            Block #{transaction.height}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500">Hash:</span>
          <div className="font-mono text-gray-900">
            {truncateHash(transaction.txhash)}
          </div>
        </div>
        
        <div>
          <span className="text-gray-500">Fee:</span>
          <div className="font-medium text-gray-900">{feeAmount}</div>
        </div>
        
        <div>
          <span className="text-gray-500">Gas:</span>
          <div className="font-medium text-gray-900">
            {parseInt(transaction.gas_used).toLocaleString()} / {parseInt(transaction.gas_wanted).toLocaleString()}
          </div>
        </div>
      </div>

      {/* Message types */}
      {messageTypes.length > 1 && (
        <div className="mb-4">
          <span className="text-gray-500 text-sm">Messages:</span>
          <div className="flex flex-wrap gap-2 mt-1">
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

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
          >
            Lihat Detail →
          </Link>
        </div>
      </div>
    </div>
  );
}
