
import React from 'react';
import AuthInput from './AuthInput';

type SignInFormProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  emailTouched: boolean;
  setEmailTouched: (touched: boolean) => void;
  passwordTouched: boolean;
  setPasswordTouched: (touched: boolean) => void;
  emailError: string | null;
  passwordError: string | null;
  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;
};

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  setEmail,
  password,
  setPassword,
  emailTouched,
  setEmailTouched,
  passwordTouched,
  setPasswordTouched,
  emailError,
  passwordError,
  rememberMe,
  setRememberMe,
}) => {
  return (
    <>
      <AuthInput
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        error={emailError}
        label="Email address"
        placeholder="your.email@example.com"
        autoComplete="email"
      />

      <AuthInput
        id="password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => setPasswordTouched(true)}
        error={passwordError}
        label="Password"
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-brand-green focus:ring-brand-green border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-brand-dark-700">
            Remember me
          </label>
        </div>

        <div className="text-sm">
          <a href="#" className="font-medium text-brand-green hover:text-brand-green-600">
            Forgot your password?
          </a>
        </div>
      </div>
    </>
  );
};

export default SignInForm;
