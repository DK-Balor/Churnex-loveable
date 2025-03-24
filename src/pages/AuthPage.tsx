
import React from 'react';
import { AuthFormProvider } from '../contexts/AuthFormContext';
import AuthForm from '../components/auth/AuthForm';

const AuthPage: React.FC = () => {
  return (
    <AuthFormProvider>
      <AuthForm />
    </AuthFormProvider>
  );
};

export default AuthPage;
