
import React from 'react';
import { X } from 'lucide-react';

type AuthInputProps = {
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  error: string | null;
  label: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  readOnly?: boolean;
};

const AuthInput = ({
  id,
  name,
  type,
  value,
  onChange,
  onBlur,
  error,
  label,
  placeholder,
  autoComplete,
  required = true,
  readOnly = false,
}: AuthInputProps) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-brand-dark-700">
        {label}
      </label>
      <div className="mt-1 relative">
        <input
          id={id}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={`appearance-none block w-full px-3 py-2 border ${
            error ? 'border-red-300' : 'border-gray-300'
          } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-green focus:border-brand-green sm:text-sm`}
          placeholder={placeholder}
        />
        {error && (
          <div className="absolute right-0 top-0 pr-3 pt-2">
            <X className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AuthInput;
