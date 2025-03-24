
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

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
  const [showPassword, setShowPassword] = React.useState(false);
  const actualType = type === 'password' && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-brand-dark-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={actualType}
          required={required}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={error ? "border-red-300" : ""}
          placeholder={placeholder}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default AuthInput;
