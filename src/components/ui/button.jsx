import { forwardRef, cloneElement, isValidElement } from 'react';
import { cn } from '@/lib/utils.js';

const VARIANTS = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  link: 'text-primary underline-offset-4 hover:underline',
};

const SIZES = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-9 rounded-md px-3 text-sm',
  lg: 'h-11 rounded-lg px-6 text-base',
  icon: 'h-10 w-10',
};

export const Button = forwardRef(function Button(
  { className, variant = 'default', size = 'default', asChild, children, ...props },
  ref
) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
    VARIANTS[variant],
    SIZES[size],
    className
  );

  if (asChild && isValidElement(children)) {
    return cloneElement(children, {
      ref,
      className: cn(classes, children.props.className),
      ...props,
    });
  }

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  );
});
