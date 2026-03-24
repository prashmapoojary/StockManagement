import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyOtp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const [requireOtp, setRequireOtp] = useState(false);
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!requireOtp) {
        const res = await login(formData.email, formData.password);
        if (res?.requireOtp) {
          setRequireOtp(true);
          toast.success('OTP sent to your email');
        } else {
          toast.success('Signed in successfully');
          navigate('/');
        }
      } else {
        await verifyOtp(formData.email, otp);
        toast.success('Signed in successfully');
        navigate('/');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-[0.25rem] shadow-xl relative overflow-hidden">
        {/* Aesthetic background accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold font-sans text-foreground">Secure Access</h1>
          <p className="text-xs text-muted-foreground font-serif italic mt-1 uppercase tracking-widest">Warehouse Management System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!requireOtp ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <Input 
                    type="email" 
                    placeholder="admin@warehouse.com" 
                    className="pl-10"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-wider ml-1">Password</label>
                <div className="relative">
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-bold font-sans uppercase text-muted-foreground tracking-wider ml-1">Verification Code (OTP)</label>
              <div className="relative">
                <Input 
                  type="text" 
                  placeholder="000000" 
                  className="pl-10 text-center text-lg tracking-[0.5em] font-mono"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Lock className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">A 6-digit code was sent to your email.</p>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 text-base font-bold font-sans" 
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (requireOtp ? 'Verify OTP' : 'Sign In')}
          </Button>

          {requireOtp && (
            <button 
              type="button" 
              onClick={() => setRequireOtp(false)}
              className="w-full text-xs font-bold uppercase text-primary hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </form>

        <p className="mt-8 text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-mono">
          Protected by AES-256 Encryption
        </p>
      </div>
      
      <p className="mt-8 text-xs text-muted-foreground/60 font-serif italic">
        © 2024 Warehouse Monitor v2.1.0 • Built with Advanced Security
      </p>
    </div>
  );
};

export default Login;
