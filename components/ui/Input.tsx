import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      helperText,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputClasses = `
      w-full px-3 py-2.5 rounded-lg
      bg-bg-secondary text-text-primary placeholder-text-muted
      border border-border-light
      transition-all duration-base ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
      hover:border-border-medium
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? 'border-error focus-visible:ring-error' : ''}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            disabled={disabled}
            className={`${inputClasses} ${icon ? 'pl-10' : ''}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-error mt-1.5">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
