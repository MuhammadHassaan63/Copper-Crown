import { ReactNode } from 'react';

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: ReactNode;
  variant?: 'copper' | 'success' | 'warning' | 'danger' | 'neutral';
  className?: string;
}) {
  const variants: Record<string, string> = {
    copper: 'badge-copper',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    neutral: 'badge-neutral',
  };
  return <span className={`${variants[variant]} ${className}`}>{children}</span>;
}
