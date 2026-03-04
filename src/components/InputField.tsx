"use client";

import { ReactNode, forwardRef, useState } from 'react';
import { EyeIcon, EyeSlashIcon, ExclamationCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  register: any;
  error?: any;
  defaultValue?: any;
  hidden?: boolean;
  className?: string;
  placeholder?: string;
  required?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  autoComplete?: string;
  helperText?: string;
  success?: boolean;
  loading?: boolean;
  maxLength?: number;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  name,
  type = "text",
  register,
  error,
  defaultValue,
  hidden,
  className = "",
  placeholder = "",
  required = false,
  icon,
  disabled = false,
  autoComplete,
  helperText,
  success = false,
  loading = false,
  maxLength,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  if (hidden) return null;

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={`w-full group ${className}`}>
      {/* Label with premium typography */}
      <label 
        htmlFor={name} 
        className={`
          block text-[13px] font-bold uppercase tracking-wider mb-2 transition-colors duration-200
          ${isFocused ? "text-primary-600 dark:text-primary-400" : "text-surface-500 dark:text-surface-400"}
          ${error ? "!text-danger-500" : ""}
        `}
      >
        {label}
        {required && <span className="ml-1 text-danger-500">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon with focus effect */}
        {icon && (
          <div className={`
            absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200
            ${isFocused ? "text-primary-500" : "text-surface-400 dark:text-surface-500"}
            ${error ? "!text-danger-500" : ""}
          `}>
            {icon}
          </div>
        )}

        {/* Input Field with premium styling */}
        <input
          ref={ref}
          id={name}
          type={inputType}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...register(name)}
          {...props}
          className={`
            w-full px-4 py-3.5 bg-surface-50 dark:bg-surface-800/50 border rounded-2xl
            text-surface-900 dark:text-white placeholder:text-surface-400/60
            transition-all duration-300 outline-none
            ${icon ? 'pl-11' : ''}
            ${isPassword ? 'pr-11' : ''}
            ${error 
              ? 'border-danger-300 dark:border-danger-500/30 ring-4 ring-danger-500/5 dark:ring-danger-500/10' 
              : isFocused
                ? 'border-primary-500/50 ring-4 ring-primary-500/10 dark:ring-primary-500/20 bg-white dark:bg-surface-800 shadow-lg shadow-primary-500/5'
                : 'border-surface-200 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-100 dark:bg-surface-900' : ''}
            text-sm font-medium
          `}
        />

        {/* Right Icons Container */}
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {loading && (
            <div className="w-4 h-4 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          )}

          {!loading && success && !error && (
            <CheckCircleIcon className="w-5 h-5 text-success-500" />
          )}

          {!loading && error && (
            <ExclamationCircleIcon className="w-5 h-5 text-danger-500 animate-shake" />
          )}

          {isPassword && !loading && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg transition-colors text-surface-400 hover:text-surface-600 dark:hover:text-surface-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Messages with animations */}
      <div className="min-h-[20px] mt-1.5 px-1">
        {error ? (
          <p className="text-xs font-bold text-danger-500 flex items-center gap-1 animate-fade-in-up">
            <XMarkIcon className="w-3.5 h-3.5" />
            {error.message}
          </p>
        ) : helperText ? (
          <p className="text-[11px] font-medium text-surface-400 dark:text-surface-500 uppercase tracking-widest pl-1">
            {helperText}
          </p>
        ) : null}
      </div>
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;

// Add some required icons locally or just use heroicons
import { XMarkIcon as XIcon } from '@heroicons/react/24/outline';
const XMarkIcon = XIcon;
