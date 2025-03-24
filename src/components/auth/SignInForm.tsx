
import React from 'react';
import { useAuthForm } from '../../contexts/AuthFormContext';
import { useAuthFormValidation } from '../../hooks/useAuthFormValidation';
import AuthInput from './AuthInput';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';

const SignInForm: React.FC = () => {
  const { state, actions } = useAuthForm();
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    emailTouched, 
    setEmailTouched, 
    passwordTouched, 
    setPasswordTouched,
    rememberMe,
    setRememberMe
  } = { ...state, ...actions };

  const validation = useAuthFormValidation(
    true, // isLogin
    email,
    password,
    '', // confirmPassword
    '', // fullName
    '', // businessName
    emailTouched,
    passwordTouched,
    false, // confirmPasswordTouched
    false, // fullNameTouched
    false // businessNameTouched
  );

  return (
    <>
      <AuthInput
        id="email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setEmailTouched(true)}
        error={validation.emailError}
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
        error={validation.passwordError}
        label="Password"
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="remember-me" 
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked === true)} 
          />
          <Label 
            htmlFor="remember-me" 
            className="text-sm text-brand-dark-700 cursor-pointer"
          >
            Remember me
          </Label>
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
