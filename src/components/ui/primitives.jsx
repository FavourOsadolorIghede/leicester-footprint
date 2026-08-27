import { forwardRef } from 'react';
import { cn } from '@/lib/utils.js';

export const Input = forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-20 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
});

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-sm font-medium leading-none peer-disabled:opacity-70', className)}
      {...props}
    />
  );
}

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(
        'flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});

export function Badge({ className, variant = 'default', ...props }) {
  const styles = {
    default: 'border-transparent bg-primary/10 text-primary',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    outline: 'text-foreground',
    success: 'border-transparent bg-cat-food/15 text-cat-food',
    warning: 'border-transparent bg-cat-energy/15 text-cat-energy',
    danger: 'border-transparent bg-destructive/15 text-destructive',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        styles[variant],
        className
      )}
      {...props}
    />
  );
}

export function Progress({ value = 0, className, indicatorClassName, color }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <div
        className={cn('h-full rounded-full bg-primary transition-all', indicatorClassName)}
        style={{ width: `${Math.max(0, Math.min(100, value))}%`, background: color }}
      />
    </div>
  );
}

export const Slider = forwardRef(function Slider({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      type="range"
      className={cn('w-full accent-primary', className)}
      {...props}
    />
  );
});
