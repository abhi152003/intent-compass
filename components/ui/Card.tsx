import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'glass';
  padding?: 'sm' | 'md' | 'lg';
  border?: boolean;
  children?: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      border = true,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'rounded-lg transition-all duration-base ease-in-out';

    const variantClasses = {
      default:
        'bg-bg-elevated shadow-md hover:shadow-lg border border-border-light',
      elevated:
        'bg-bg-elevated shadow-lg hover:shadow-xl border border-border-light',
      glass:
        'bg-bg-elevated/50 backdrop-blur-md border border-border-light/50 shadow-md hover:shadow-lg',
    };

    const paddingClasses = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    };

    const borderClass = border ? variantClasses[variant] : `${baseClasses} bg-bg-elevated`;

    const cardClasses = `${baseClasses} ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`;

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
