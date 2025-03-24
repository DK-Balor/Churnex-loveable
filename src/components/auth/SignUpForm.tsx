
import React from 'react';
import AuthInput from './AuthInput';

type SignUpFormProps = {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  fullName: string;
  setFullName: (fullName: string) => void;
  businessName: string;
  setBusinessName: (businessName: string) => void;
  emailTouched: boolean;
  setEmailTouched: (touched: boolean) => void;
  passwordTouched: boolean;
  setPasswordTouched: (touched: boolean) => void;
  confirmPasswordTouched: boolean;
  setConfirmPasswordTouched: (touched: boolean) => void;
  fullNameTouched: boolean;
  setFullNameTouched: (touched: boolean) => void;
  businessNameTouched: boolean;
  setBusinessNameTouched: (touched: boolean) => void;
  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  fullNameError: string | null;
  businessNameError: string | null;
};

const SignUpForm: React.FC<SignUpFormProps> = ({
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
  setBusinessNameTouched,
  emailError,
  passwordError,
  confirmPasswordError,
  fullNameError,
  businessNameError,
}) => {
  return (
    <>
      <AuthInput
        id="fullName"
        name="fullName"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        onBlur={() => setFullNameTouched(true)}
        error={fullNameError}
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
        error={businessNameError}
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
        autoComplete="new-password"
      />

      <AuthInput
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={() => setConfirmPasswordTouched(true)}
        error={confirmPasswordError}
        label="Confirm Password"
        autoComplete="new-password"
      />
    </>
  );
};

export default SignUpForm;
