import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      children,
      disabled,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center font-semibold font-heading rounded-lg transition-all duration-base ease-in-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-orange disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

    const variantClasses = {
      primary:
        'bg-accent-orange text-bg-primary border border-accent-orange hover:bg-opacity-90 hover:border-accent-orange active:scale-95 shadow-md hover:shadow-lg',
      secondary:
        'bg-bg-elevated text-text-primary border-2 border-border-medium hover:bg-bg-hover hover:border-text-primary active:scale-95 shadow-sm hover:shadow-md',
      ghost:
        'text-text-primary border-2 border-text-muted hover:bg-bg-hover hover:border-text-primary active:scale-95',
      danger:
        'bg-error text-bg-primary border border-error hover:bg-opacity-90 hover:border-error active:scale-95 shadow-md hover:shadow-lg',
    };

    const sizeClasses = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-3',
    };

    const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={buttonClasses}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children && <span>{children}</span>}
          </>
        ) : (
          <>
            {icon && <span className="inline-flex">{icon}</span>}
            {children && <span>{children}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
