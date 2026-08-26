import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  prefix,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  className = '',
  inputClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
          {label} {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}
      <div className="relative rounded-lg shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        {prefix && !Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 font-medium text-sm">
            {prefix}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`block w-full rounded-lg border text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 ${
            Icon ? 'pl-9' : prefix ? 'pl-8' : 'pl-3.5'
          } pr-3.5 py-2 ${
            error
              ? 'border-red-400 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50/20'
              : 'border-slate-300 text-slate-900 bg-white placeholder-slate-400 hover:border-slate-400'
          } ${inputClassName}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
