import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ size = 24, className = '' }: { size?: number; className?: string }) {
  return <Loader2 className={`animate-spin text-copper-500 ${className}`} style={{ width: size, height: size }} />;
}

export function FullPageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-crown-50">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size={48} />
        <p className="text-crown-400 text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && <div className="mb-4 text-crown-300">{icon}</div>}
      <h3 className="text-lg font-semibold text-crown-700">{title}</h3>
      {description && <p className="mt-1 text-sm text-crown-400 max-w-md">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
