
import React, { useState } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface VerificationCodeInputProps {
  email: string;
  onVerificationSuccess: () => void;
  onResendCode: () => Promise<void>;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({ 
  email, 
  onVerificationSuccess,
  onResendCode
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      toast({
        title: "Verification code required",
        description: "Please enter the code sent to your email.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'signup'
      });

      if (error) {
        console.error('Verification error:', error);
        toast({
          title: "Verification failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email verified",
          description: "Your email has been successfully verified.",
        });
        onVerificationSuccess();
      }
    } catch (error: any) {
      console.error('Verification exception:', error);
      toast({
        title: "Verification error",
        description: error.message || "An error occurred during verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-brand-dark-500">
          We've sent a verification code to <span className="font-medium">{email}</span>.
          Please enter the code below to verify your account.
        </p>
      </div>
      
      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium text-brand-dark-700">
            Verification Code
          </label>
          <input
            id="verificationCode"
            name="verificationCode"
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-green focus:border-brand-green"
            placeholder="Enter your verification code"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !verificationCode}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 ${
            isSubmitting || !verificationCode
              ? 'bg-brand-green-300 cursor-not-allowed'
              : 'bg-brand-green hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green'
          }`}
        >
          {isSubmitting ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>

      <div className="mt-3 text-center">
        <button 
          onClick={onResendCode}
          type="button"
          className="text-sm text-brand-green hover:text-brand-green-600"
        >
          Didn't receive a code? Resend
        </button>
      </div>
    </div>
  );
};

export default VerificationCodeInput;
