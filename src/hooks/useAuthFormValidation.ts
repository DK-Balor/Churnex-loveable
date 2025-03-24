
import { useState, useEffect } from 'react';

export type ValidationResult = {
  emailIsValid: boolean;
  passwordIsValid: boolean;
  passwordsMatch: boolean;
  fullNameIsValid: boolean;
  businessNameIsValid: boolean;
  emailError: string | null;
  passwordError: string | null;
  confirmPasswordError: string | null;
  fullNameError: string | null;
  businessNameError: string | null;
  formIsValid: boolean;
};

export const useAuthFormValidation = (
  isLogin: boolean,
  email: string,
  password: string,
  confirmPassword: string,
  fullName: string,
  businessName: string,
  emailTouched: boolean,
  passwordTouched: boolean,
  confirmPasswordTouched: boolean,
  fullNameTouched: boolean,
  businessNameTouched: boolean
): ValidationResult => {
  // Form validation
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordIsValid = password.length >= 6;
  const passwordsMatch = password === confirmPassword;
  const fullNameIsValid = fullName.length > 0;
  const businessNameIsValid = businessName.length > 0;
  
  const emailError = emailTouched && !emailIsValid ? 'Please enter a valid email address' : null;
  const passwordError = passwordTouched && !passwordIsValid ? 'Password must be at least 6 characters' : null;
  const confirmPasswordError = confirmPasswordTouched && !passwordsMatch ? 'Passwords do not match' : null;
  const fullNameError = fullNameTouched && !fullNameIsValid ? 'Please enter your full name' : null;
  const businessNameError = businessNameTouched && !businessNameIsValid ? 'Please enter your business name' : null;

  const formIsValid = emailIsValid && passwordIsValid && 
    (isLogin || (passwordsMatch && fullNameIsValid && businessNameIsValid));

  return {
    emailIsValid,
    passwordIsValid,
    passwordsMatch,
    fullNameIsValid,
    businessNameIsValid,
    emailError,
    passwordError,
    confirmPasswordError,
    fullNameError,
    businessNameError,
    formIsValid
  };
};
