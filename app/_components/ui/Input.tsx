'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// ========== Input ==========
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, className = '', type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPassword = type === 'password';
        const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

        const baseStyles = `
            w-full px-4 py-3 
            border-2 border-black 
            font-bold 
            focus:outline-none focus:shadow-neo
            transition-shadow
            disabled:bg-gray-100 disabled:cursor-not-allowed
        `;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold mb-2 uppercase">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type={inputType}
                        className={`
                            ${baseStyles}
                            ${error ? 'border-red-500' : ''}
                            ${className}
                            ${isPassword ? 'pr-12' : ''}
                        `.trim()}
                        {...props}
                    />
                    {isPassword && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none bg-transparent border-none shadow-none transition-none active:translate-x-0 active:-translate-y-1/2"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    )}
                </div>
                {hint && !error && (
                    <p className="mt-1 text-xs text-gray-500">{hint}</p>
                )}
                {error && (
                    <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// ========== Textarea ==========
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, className = '', rows = 4, ...props }, ref) => {
        const baseStyles = `
            w-full px-4 py-3 
            border-2 border-black 
            font-bold 
            focus:outline-none focus:shadow-neo
            transition-shadow resize-none
            disabled:bg-gray-100 disabled:cursor-not-allowed
        `;

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-bold mb-2 uppercase">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    rows={rows}
                    className={`
                        ${baseStyles}
                        ${error ? 'border-red-500' : ''}
                        ${className}
                    `.trim()}
                    {...props}
                />
                {hint && !error && (
                    <p className="mt-1 text-xs text-gray-500">{hint}</p>
                )}
                {error && (
                    <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

// ========== Select ==========
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options: { value: string; label: string }[];
    placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, options, placeholder, className = '', ...props }, ref) => {
        const baseStyles = `
            w-full px-4 py-3 
            border-2 border-black 
            font-bold bg-white
            focus:outline-none focus:shadow-neo
            transition-shadow
            disabled:bg-gray-100 disabled:cursor-not-allowed
            appearance-none cursor-pointer
        `;

        return (
            <div className="w-full relative">
                {label && (
                    <label className="block text-sm font-bold mb-2 uppercase">
                        {label}
                        {props.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}
                <div className="relative">
                    <select
                        ref={ref}
                        className={`
                            ${baseStyles}
                            ${error ? 'border-red-500' : ''}
                            ${className}
                        `.trim()}
                        {...props}
                    >
                        {placeholder && (
                            <option value="" disabled>
                                {placeholder}
                            </option>
                        )}
                        {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    {/* Dropdown arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
                {error && (
                    <p className="mt-1 text-xs text-red-500 font-bold">{error}</p>
                )}
            </div>
        );
    }
);

Select.displayName = 'Select';

// ========== Checkbox ==========
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, className = '', ...props }, ref) => {
        return (
            <label className={`flex items-center gap-3 cursor-pointer group ${className}`}>
                <input
                    ref={ref}
                    type="checkbox"
                    className="w-5 h-5 border-2 border-black appearance-none cursor-pointer
                        checked:bg-neo-green checked:border-black
                        focus:outline-none focus:ring-2 focus:ring-neo-yellow"
                    {...props}
                />
                <span className="font-bold text-sm group-hover:underline">{label}</span>
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';
