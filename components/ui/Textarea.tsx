import React from 'react';

interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      maxLength,
      showCount = false,
      className = '',
      disabled = false,
      ...props
    },
    ref
  ) => {
    const textareaClasses = `
      w-full px-3 py-2.5 rounded-lg
      bg-bg-secondary text-text-primary placeholder-text-muted
      border border-border-light
      transition-all duration-base ease-in-out
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-orange focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary
      hover:border-border-medium
      disabled:opacity-50 disabled:cursor-not-allowed
      resize-vertical min-h-[120px]
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
          <textarea
            ref={ref}
            disabled={disabled}
            maxLength={maxLength}
            className={textareaClasses}
            {...props}
          />
          {showCount && maxLength && (
            <div className="absolute bottom-2 right-3 text-xs text-text-muted">
              {(props.value as string)?.length || 0} / {maxLength}
            </div>
          )}
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

Textarea.displayName = 'Textarea';

export default Textarea;
