interface GlobalStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  status?: 'success' | 'warning' | 'error' | 'info';
  isLoading?: boolean;
}

export default function GlobalStatsCard({ 
  title, 
  value, 
  subtitle, 
  status = 'info',
  isLoading = false 
}: GlobalStatsCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getValueColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 shadow-sm transition-all hover:shadow-md ${getStatusColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
          <div className={`text-2xl font-bold ${getValueColor()}`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="ml-4">
          {status === 'success' && (
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          )}
          {status === 'warning' && (
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          )}
          {status === 'error' && (
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          )}
          {status === 'info' && (
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}
