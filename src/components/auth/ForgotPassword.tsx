import { useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from '@/contexts/AuthContexts';
import { useRouter } from 'next/navigation';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export function ForgotPasswordModal({ isOpen, onClose, email }: ForgotPasswordModalProps) {
  const [emailInput, setEmailInput] = useState(email);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { forgotPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!emailInput.trim()) {
      setError("Please enter an email address");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword(emailInput);

      sessionStorage.setItem('reset_email', emailInput);

      // set expiry timestamp for timer
      sessionStorage.setItem('resend_otp', (Date.now() + 300000).toString());

      router.push('/reset-password/verify-otp');
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
        <div className="space-y-4">
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your email address"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button" 
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loading ? "Sending..." : "Reset Password"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}