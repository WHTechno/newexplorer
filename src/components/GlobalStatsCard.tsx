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
        return 'border-green-400 bg-surface';
      case 'warning':
        return 'border-yellow-400 bg-surface';
      case 'error':
        return 'border-red-400 bg-surface';
      default:
        return 'border-secondary bg-surface';
    }
  };

  const getValueColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'warning':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      default:
        return 'text-primary';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-default rounded-lg p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-secondary rounded w-3/4 mb-3"></div>
          <div className="h-8 bg-secondary rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-6 shadow-sm transition-all hover:shadow-md bg-surface border-default text-foreground`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-secondary mb-2">{title}</h3>
          <div className={`text-2xl font-bold text-foreground`}>{value}</div>
          {subtitle && (
            <p className="text-sm text-secondary mt-1">{subtitle}</p>
          )}
        </div>
        {/* Status indicator */}
        <div className="ml-4">
          {status === 'success' && (
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          )}
          {status === 'warning' && (
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
          )}
          {status === 'error' && (
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
          )}
          {status === 'info' && (
            <div className="w-3 h-3 bg-primary rounded-full"></div>
          )}
        </div>
      </div>
    </div>
  );
}
