
import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/ui/use-toast';
import { supabase, sendVerificationEmail } from '../../integrations/supabase/client';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { toast } = useToast();

  // Handle countdown for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60); // Disable resend for 60 seconds
    
    try {
      console.log('Resending verification email to:', email);
      const { error } = await sendVerificationEmail(email);
      
      if (error) {
        console.error('Error resending code:', error);
        toast({
          title: "Failed to resend verification email",
          description: error.message || "An error occurred while sending the verification email",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification email sent",
          description: `A verification link has been sent to ${email}. Please check your inbox (including spam/junk folders) and click the link to verify your email.`,
        });
      }
    } catch (error: any) {
      console.error('Exception resending code:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred while sending the verification email",
        variant: "destructive",
      });
    }
    
    await onResendCode();
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-brand-dark-500">
          We've sent a verification link to <span className="font-medium">{email}</span>.
          Please check your inbox and click the link to verify your account.
        </p>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
        <p className="text-sm text-amber-800">
          <strong>Important:</strong> The verification email may take a few minutes to arrive. 
          Please check your spam/junk folders if you don't see it in your inbox.
        </p>
      </div>

      <div className="mt-3 text-center">
        <button 
          onClick={handleResendCode}
          type="button"
          disabled={resendDisabled}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors duration-300 ${
            resendDisabled 
              ? 'bg-brand-green-300 cursor-not-allowed' 
              : 'bg-brand-green hover:bg-brand-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green'
          }`}
        >
          {resendDisabled 
            ? `Resend verification link in ${countdown}s` 
            : "Didn't receive a link? Resend"}
        </button>
      </div>
    </div>
  );
};

export default VerificationCodeInput;
