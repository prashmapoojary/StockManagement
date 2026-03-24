import React from 'react';
import { twMerge } from 'tailwind-merge';

const Badge = ({ children, variant = 'info', className }) => {
  const variants = {
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    muted: 'bg-muted text-muted-foreground border-border',
  };

  // Status mapping for Warehouse App
  const statusVariants = {
    'IN_STOCK': 'success',
    'LOW_STOCK': 'warning',
    'OUT_OF_STOCK': 'danger',
    'OK': 'success',
    'LOW': 'warning',
    'OUT': 'danger',
  };

  const activeVariant = statusVariants[variant] || variant;

  return (
    <span
      className={twMerge(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border font-serif',
        variants[activeVariant] || variants.info,
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;
