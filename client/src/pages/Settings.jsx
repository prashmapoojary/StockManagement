import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from '../api/authApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';
import { User, Lock } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
  otp: z.string().optional(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Settings = () => {
  const { user, requestPasswordOtp } = useAuth();
  const [otpRequested, setOtpRequested] = React.useState(false);

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const passwordMutation = useMutation({
    mutationFn: updatePassword,
    onSuccess: () => {
      passwordForm.reset();
      setOtpRequested(false);
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  });

  const requestOtpMutation = useMutation({
    mutationFn: requestPasswordOtp,
    onSuccess: () => {
      setOtpRequested(true);
      toast.success('OTP sent to prashmapoojary@gmail.com');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl font-bold font-sans text-foreground">System Settings</h1>
        <p className="text-muted-foreground font-serif italic text-sm mt-1">Manage your account preferences and security</p>
      </header>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Information (View Only) */}
        <section className="bg-card border border-border p-6 rounded-[0.25rem] shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-sans font-bold uppercase tracking-wider text-xs">Account Information</h2>
          </div>
          <div className="space-y-3 font-serif">
            <div>
              <p className="text-[10px] font-bold font-sans uppercase text-muted-foreground">Full Name</p>
              <p className="font-bold">{user?.name || 'Warehouse Admin'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold font-sans uppercase text-muted-foreground">Email Address</p>
              <p className="font-bold">prashmapoojary@gmail.com</p>
            </div>
            <p className="text-[10px] italic text-muted-foreground pt-2">Note: Account details are managed by the system administrator.</p>
          </div>
        </section>

        {/* Password Section */}
        <section className="bg-card border border-border p-6 rounded-[0.25rem] shadow-sm">
          <div className="flex items-center gap-2 mb-6 pb-2 border-b border-border">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="font-sans font-bold uppercase tracking-wider text-xs">Security & Password</h2>
          </div>
          
          <form onSubmit={passwordForm.handleSubmit((data) => passwordMutation.mutate(data))} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold font-sans uppercase text-muted-foreground px-1">Current Password</label>
              <Input type="password" {...passwordForm.register('currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-sans uppercase text-muted-foreground px-1">New Password</label>
                <Input type="password" {...passwordForm.register('newPassword')} error={passwordForm.formState.errors.newPassword?.message} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-sans uppercase text-muted-foreground px-1">Confirm New Password</label>
                <Input type="password" {...passwordForm.register('confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} />
              </div>
            </div>

            {otpRequested && (
              <div className="space-y-1 pt-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-bold font-sans uppercase text-primary px-1">Enter Verification OTP</label>
                <Input 
                  placeholder="000000" 
                  className="font-mono text-center tracking-[0.5em]"
                  {...passwordForm.register('otp', { required: 'OTP is required' })} 
                  error={passwordForm.formState.errors.otp?.message}
                />
              </div>
            )}

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              {!otpRequested ? (
                <Button 
                  type="button" 
                  onClick={() => requestOtpMutation.mutate()}
                  disabled={requestOtpMutation.isPending}
                  className="font-bold flex-1"
                >
                  {requestOtpMutation.isPending ? 'Sending...' : 'Request OTP to Change Password'}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={passwordMutation.isPending} 
                  className="font-bold flex-1"
                >
                  {passwordMutation.isPending ? 'Updating...' : 'Verify OTP & Change Password'}
                </Button>
              )}
              {otpRequested && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setOtpRequested(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Settings;
