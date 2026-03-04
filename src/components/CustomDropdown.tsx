"use client";

import { useState, useRef, useEffect, forwardRef } from 'react';
import { ChevronDownIcon, MagnifyingGlassIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

interface CustomDropdownProps {
  label: string;
  name: string;
  options: Option[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: any;
  searchable?: boolean;
  multiSelect?: boolean;
  maxHeight?: string;
  className?: string;
  helperText?: string;
  loading?: boolean;
  emptyMessage?: string;
  noOptionsMessage?: string;
  icon?: React.ReactNode;
}

const CustomDropdown = forwardRef<HTMLDivElement, CustomDropdownProps>(({
  label,
  name,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  error,
  searchable = false,
  multiSelect = false,
  maxHeight = "max-h-64",
  className = "",
  helperText,
  loading = false,
  emptyMessage = "No options available",
  noOptionsMessage = "No results found"
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOptions = multiSelect && Array.isArray(value) 
    ? options.filter(option => (value as (string | number)[]).includes(option.value))
    : options.filter(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (disabled || loading) return;
    setIsOpen(!isOpen);
    if (!isOpen && searchable) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleOptionSelect = (option: Option) => {
    if (option.disabled) return;

    if (multiSelect) {
      const currentValues = (Array.isArray(value) ? value : []) as (string | number)[];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
    }
  };

  return (
    <div className={`w-full group ${className}`} ref={dropdownRef}>
      {/* Label */}
      <label 
        className={`
          block text-[13px] font-bold uppercase tracking-wider mb-2 transition-colors duration-200
          ${isOpen ? "text-primary-600 dark:text-primary-400" : "text-surface-500 dark:text-surface-400"}
          ${error ? "!text-danger-500" : ""}
        `}
      >
        {label}
        {required && <span className="ml-1 text-danger-500">*</span>}
      </label>

      {/* Trigger */}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={`
            w-full px-4 py-3.5 text-left bg-surface-50 dark:bg-surface-800/50 border rounded-2xl
            transition-all duration-300 outline-none flex items-center justify-between
            ${error 
              ? 'border-danger-300 dark:border-danger-500/30 ring-4 ring-danger-500/5' 
              : isOpen
                ? 'border-primary-500/50 ring-4 ring-primary-500/10 dark:ring-primary-500/20 bg-white dark:bg-surface-800 shadow-lg'
                : 'border-surface-200 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed bg-surface-100 dark:bg-surface-900' : ''}
          `}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedOptions.length > 0 ? (
              <div className="flex gap-1 overflow-hidden">
                {multiSelect ? (
                  <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                    {selectedOptions.length} Selected
                  </span>
                ) : (
                    <div className="flex items-center gap-2">
                        {selectedOptions[0].icon && <span className="text-surface-400">{selectedOptions[0].icon}</span>}
                        <span className="text-sm font-bold text-surface-900 dark:text-white truncate">
                            {selectedOptions[0].label}
                        </span>
                    </div>
                )}
              </div>
            ) : (
              <span className="text-sm font-medium text-surface-400/60">{placeholder}</span>
            )}
          </div>
          <ChevronDownIcon className={`w-5 h-5 text-surface-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`
            absolute z-[60] w-full mt-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700
            rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in-up
          `}>
            {searchable && (
              <div className="p-4 border-b border-surface-100 dark:border-surface-700/50 bg-surface-50/30 dark:bg-surface-900/30">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Quick search..."
                    className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className={`overflow-y-auto ${maxHeight} custom-scrollbar p-2`}>
              {filteredOptions.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm font-medium text-surface-400 uppercase tracking-widest">
                    {noOptionsMessage}
                  </p>
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiSelect 
                    ? (value as any[])?.includes(option.value)
                    : value === option.value;
                    
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleOptionSelect(option)}
                      className={`
                        w-full p-3 flex items-center gap-3 rounded-2xl transition-all duration-200 group/item mb-1
                        ${isSelected 
                          ? 'bg-primary-50 dark:bg-primary-500/10' 
                          : 'hover:bg-surface-50 dark:hover:bg-surface-700/50'
                        }
                      `}
                    >
                      <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${isSelected 
                          ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20' 
                          : 'bg-surface-100 dark:bg-surface-700 text-surface-400 dark:text-surface-500 group-hover/item:bg-white dark:group-hover/item:bg-surface-600'
                        }
                      `}>
                        {isSelected ? <CheckIcon className="w-5 h-5 stroke-[3px]" /> : (option.icon || <span className="text-[10px] font-bold uppercase">{option.label.charAt(0)}</span>)}
                      </div>
                      
                      <div className="flex-1 text-left">
                        <p className={`text-sm font-bold transition-colors ${isSelected ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>
                          {option.label}
                        </p>
                      </div>

                      {multiSelect && !isSelected && (
                         <div className="w-5 h-5 rounded-md border-2 border-surface-200 dark:border-surface-600 group-hover/item:border-primary-500/50 transition-colors" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer messages */}
      <div className="min-h-[20px] mt-1.5 px-1">
        {error ? (
          <p className="text-xs font-bold text-danger-500 animate-fade-in-up">
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

CustomDropdown.displayName = 'CustomDropdown';

export default CustomDropdown;