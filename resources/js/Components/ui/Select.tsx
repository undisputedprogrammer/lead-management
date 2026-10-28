import React, { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    options: SelectOption[];
    hasError?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ options, hasError = false, className = '', children, ...props }, ref) => {
        const borderStyles = hasError
            ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500';

        return (
            <select
                ref={ref}
                className={`block w-full rounded-lg text-sm shadow-sm transition-colors ${borderStyles} ${className}`}
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        );
    }
);

Select.displayName = 'Select';

export default Select;

