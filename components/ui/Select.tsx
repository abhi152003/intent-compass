import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const selectClasses = `
      w-full px-3 py-2.5 pr-10 rounded-lg
      bg-bg-secondary text-text-primary
      border border-border-light
      transition-all duration-base ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
      hover:border-border-medium
      disabled:opacity-50 disabled:cursor-not-allowed
      cursor-pointer
      appearance-none
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
          <select
            ref={ref}
            disabled={disabled}
            className={selectClasses}
            {...props}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';

export default Select;
