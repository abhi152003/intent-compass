'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  (
    {
      label,
      error,
      helperText,
      className = '',
      disabled = false,
      children,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<string | number>(value as string || '');
    const [selectedLabel, setSelectedLabel] = useState<string>('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hiddenSelectRef = useRef<HTMLSelectElement>(null);

    // Extract options from children
    interface OptionProps {
      value: string | number;
      children: React.ReactNode;
    }

    const options = React.Children.toArray(children).filter(
      (child): child is React.ReactElement<OptionProps> =>
        React.isValidElement(child) && child.type === 'option'
    );

    // Update selected label when value changes
    useEffect(() => {
      const currentValue = value !== undefined ? value : selectedValue;
      const option = options.find(opt => String(opt.props.value) === String(currentValue));
      if (option) {
        setSelectedLabel(option.props.children as string);
        setSelectedValue(currentValue as string);
      }
    }, [value, options, selectedValue]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    const handleToggle = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleSelect = (optionValue: string | number, optionLabel: string) => {
      setSelectedValue(optionValue);
      setSelectedLabel(optionLabel);
      setIsOpen(false);

      // Trigger onChange event
      if (onChange && hiddenSelectRef.current) {
        hiddenSelectRef.current.value = String(optionValue);
        const event = new Event('change', { bubbles: true });
        Object.defineProperty(event, 'target', {
          writable: false,
          value: hiddenSelectRef.current
        });
        onChange(event as any);
      }
    };

    const selectClasses = `
      w-full px-3 py-2.5 pr-10 rounded-lg
      bg-bg-secondary text-text-primary
      border border-border-light
      transition-all duration-base ease-in-out
      hover:border-border-medium
      cursor-pointer
      ${isOpen ? 'ring-2 ring-accent-orange ring-offset-2 ring-offset-bg-primary border-accent-orange' : ''}
      ${error ? 'border-error' : ''}
      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-text-primary mb-2">
            {label}
          </label>
        )}

        {/* Hidden native select for form compatibility */}
        <select
          ref={(node) => {
            hiddenSelectRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref && 'current' in ref) {
              ref.current = node;
            }
          }}
          value={value !== undefined ? value : selectedValue}
          onChange={onChange}
          className="sr-only"
          disabled={disabled}
          {...props}
        >
          {children}
        </select>

        {/* Custom select UI */}
        <div className="relative" ref={dropdownRef}>
          <div
            className={selectClasses}
            onClick={handleToggle}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
          >
            <span className={selectedLabel ? 'text-text-primary' : 'text-text-muted'}>
              {selectedLabel || 'Select an option'}
            </span>
          </div>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <ChevronDown
              className={`w-4 h-4 text-text-muted transition-transform duration-base ${
                isOpen ? 'rotate-180' : ''
              }`}
            />
          </div>

          {/* Dropdown menu */}
          {isOpen && !disabled && (
            <div
              className="absolute z-50 w-full mt-2 py-1 border-2 border-border-medium rounded-lg shadow-xl max-h-60 overflow-y-auto"
              style={{ backgroundColor: '#2f2e2d' }}
            >
              {options.map((option, index) => {
                const optionValue = option.props.value;
                const optionLabel = option.props.children as string;
                const isSelected = String(optionValue) === String(selectedValue);

                return (
                  <div
                    key={index}
                    className={`
                      px-3 py-2.5 cursor-pointer transition-all duration-fast
                      ${isSelected
                        ? 'bg-accent-orange text-bg-primary font-semibold'
                        : 'text-text-primary hover:bg-bg-hover'
                      }
                    `}
                    onClick={() => handleSelect(optionValue, optionLabel)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {optionLabel}
                  </div>
                );
              })}
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

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
