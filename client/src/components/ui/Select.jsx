import React from 'react';
import { twMerge } from 'tailwind-merge';

const Select = React.forwardRef(({ options, className, error, ...props }, ref) => {
  return (
    <div className="w-full">
      <select
        ref={ref}
        className={twMerge(
          'flex h-10 w-full bg-card border border-border px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 rounded-[0.25rem] transition-all appearance-none',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-destructive font-serif">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
