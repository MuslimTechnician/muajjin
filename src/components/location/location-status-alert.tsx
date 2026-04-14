import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

export interface LocationStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

interface LocationStatusAlertProps {
  status: LocationStatus | null;
  mode?: 'onboarding' | 'settings';
}

export function LocationStatusAlert({
  status,
  mode = 'settings',
}: LocationStatusAlertProps) {
  if (!status) return null;

  if (mode === 'onboarding') {
    const bgClass =
      status.type === 'success'
        ? 'bg-green-500/10 text-green-700 dark:text-green-400'
        : status.type === 'error'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-blue-500/10 text-blue-700 dark:text-blue-400';

    return (
      <div className={`flex items-center gap-2 rounded-lg p-3 ${bgClass}`}>
        {status.type === 'success' && (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        )}
        {status.type === 'error' && (
          <AlertCircle className="h-5 w-5 text-destructive" />
        )}
        {status.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
        <span className="text-sm font-medium">{status.message}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-start gap-2 rounded-md border p-3 ${
        status.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
          : status.type === 'error'
            ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
            : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
      }`}>
      {status.type === 'success' && (
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      {status.type === 'error' && (
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      )}
      {status.type === 'info' && (
        <Loader2 className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin" />
      )}
      <p className="text-sm">{status.message}</p>
    </div>
  );
}
