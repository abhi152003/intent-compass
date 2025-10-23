import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'orange' | 'blue' | 'green';
  size?: 'sm' | 'md';
  children?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'sm',
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold rounded-full transition-colors duration-base';

    const variantClasses = {
      default: 'bg-bg-secondary text-text-secondary',
      success: 'bg-success/15 text-success border border-success/30',
      warning: 'bg-warning/15 text-warning border border-warning/30',
      error: 'bg-error/15 text-error border border-error/30',
      info: 'bg-info/15 text-info border border-info/30',
      orange: 'bg-accent-orange/15 text-accent-orange border border-accent-orange/30',
      blue: 'bg-accent-blue/15 text-accent-blue border border-accent-blue/30',
      green: 'bg-accent-green/15 text-accent-green border border-accent-green/30',
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    };

    const badgeClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <span ref={ref} className={badgeClasses} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
