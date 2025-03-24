
import React from 'react';
import { useAuthForm } from '../../contexts/AuthFormContext';
import { useAuthFormValidation } from '../../hooks/useAuthFormValidation';
import AuthInput from './AuthInput';

const SignUpForm: React.FC = () => {
  const { state, actions } = useAuthForm();
  const { 
    email, 
    setEmail, 
    password, 
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    businessName,
    setBusinessName,
    emailTouched, 
    setEmailTouched, 
    passwordTouched, 
    setPasswordTouched,
    confirmPasswordTouched,
    setConfirmPasswordTouched,
    fullNameTouched,
    setFullNameTouched,
    businessNameTouched,
    setBusinessNameTouched
  } = { ...state, ...actions };

  const validation = useAuthFormValidation(
    false, // isLogin
    email,
    password,
    confirmPassword,
    fullName,
    businessName,
    emailTouched,
    passwordTouched,
    confirmPasswordTouched,
    fullNameTouched,
    businessNameTouched
  );

  return (
    <>
      <AuthInput
        id="fullName"
        name="fullName"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        onBlur={() => setFullNameTouched(true)}
        error={validation.fullNameError}
        label="Full Name"
        placeholder="John Doe"
      />

      <AuthInput
        id="businessName"
        name="businessName"
        type="text"
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
        onBlur={() => setBusinessNameTouched(true)}
        error={validation.businessNameError}
        label="Business Name"
        placeholder="Acme Inc."
      />

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
        autoComplete="new-password"
      />

      <AuthInput
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={() => setConfirmPasswordTouched(true)}
        error={validation.confirmPasswordError}
        label="Confirm Password"
        autoComplete="new-password"
      />
    </>
  );
};

export default SignUpForm;
