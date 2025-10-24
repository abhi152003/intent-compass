import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />

      {/* Modal Content */}
      <Card
        variant="elevated"
        className={`relative ${sizeClasses[size]} w-full mx-4 max-h-screen overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            {title && (
              <h2 className="text-xl font-bold text-text-primary">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            )}
          </div>
          {closeButton && (
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-4 p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-bg-hover transition-all duration-base cursor-pointer border border-transparent hover:border-border-light"
              aria-label="Close modal"
              title="Close modal"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="mb-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-border-light pt-4 flex gap-3 justify-end">
            {footer}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Modal;
