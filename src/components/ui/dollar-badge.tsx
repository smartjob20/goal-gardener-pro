import { DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DollarBadgeProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gold' | 'gradient';
}

export function DollarBadge({ amount, className, size = 'md', variant = 'default' }: DollarBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs gap-0.5',
    md: 'text-sm gap-1',
    lg: 'text-base gap-1.5',
  };

  const variantClasses = {
    default: 'text-amber-600',
    gold: 'text-yellow-600 font-bold',
    gradient: 'bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent font-bold',
  };

  const iconSize = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <span className={cn('inline-flex items-center', sizeClasses[size], variantClasses[variant], className)}>
      <DollarSign className={cn(iconSize[size], 'flex-shrink-0')} />
      {amount}
    </span>
  );
}
