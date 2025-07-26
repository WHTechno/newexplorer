import Link from 'next/link';
import { 
  formatPercentage, 
  getValidatorStatusColor, 
  getValidatorStatusText,
  truncateAddress,
  formatTokenAmountWithNetwork
} from '@/lib/utils';
import { useNetwork } from '@/contexts/NetworkContext';

interface ValidatorTableProps {
  validators: Array<{
    operator_address: string;
    consensus_pubkey?: {
      '@type': string;
      key: string;
    };
    jailed: boolean;
    status: string;
    tokens: string;
    delegator_shares: string;
    description: {
      moniker: string;
      identity?: string;
      website?: string;
      security_contact?: string;
      details?: string;
    };
    unbonding_height: string;
    unbonding_time: string;
    commission: {
      commission_rates: {
        rate: string;
        max_rate: string;
        max_change_rate: string;
      };
      update_time: string;
    };
    min_self_delegation: string;
    profilePicture?: string | null;
  }>;
  totalTokens?: string;
  isLoading?: boolean;
}

export default function ValidatorTable({ validators, totalTokens, isLoading }: ValidatorTableProps) {
  const { currentNetwork } = useNetwork();
  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-4 bg-gray-200 rounded"></div>
                <div className="w-16 h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedValidators = [...validators].sort((a, b) => 
    parseFloat(b.tokens) - parseFloat(a.tokens)
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Validators ({validators.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-surface">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Validator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Voting Power
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Commission
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-gray-200">
            {sortedValidators.map((validator, index) => {
              const votingPower = parseFloat(validator.tokens);
              const votingPowerPercentage = totalTokens 
                ? (votingPower / parseFloat(totalTokens)) * 100 
                : 0;
              const commission = parseFloat(validator.commission.commission_rates.rate) * 100;
              const statusColor = getValidatorStatusColor(validator.status);
              const statusText = getValidatorStatusText(validator.status);

              return (
                <tr key={validator.operator_address} className="hover:border border-primary">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                    #{index + 1}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {validator.profilePicture ? (
                          <img
                            src={validator.profilePicture}
                            alt={validator.description.moniker}
                            className="h-10 w-10 rounded-full object-cover"
                            onError={(e) => {
                              // Fallback to initial avatar if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className={`h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center ${
                            validator.profilePicture ? 'hidden' : 'flex'
                          }`}
                        >
                          <span className="text-white font-medium text-sm">
                            {validator.description.moniker.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {validator.description.moniker}
                        </div>
                        <div className="text-sm text-gray-500 font-mono">
                          {truncateAddress(validator.operator_address)}
                        </div>
                        {validator.description.identity && (
                          <div className="text-xs text-blue-600">
                            Keybase: {validator.description.identity}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                      {validator.jailed && (
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      )}
                      {validator.jailed ? 'Jailed' : statusText}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    <div>
                      <div className="font-medium">
                        {formatTokenAmountWithNetwork(validator.tokens, currentNetwork.coinSymbol, currentNetwork.coinDecimals)}
                      </div>
                      <div className="text-gray-500">
                        {formatPercentage(votingPowerPercentage, 2)}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                    {formatPercentage(commission, 2)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link 
                      href={`/validators/${validator.operator_address}`}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {validators.length === 0 && !isLoading && (
        <div className="px-6 py-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No validators</h3>
          <p className="mt-1 text-sm text-gray-500">
            No validators found.
          </p>
        </div>
      )}
    </div>
  );
}
