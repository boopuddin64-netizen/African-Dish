import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User, LogIn, Sparkles, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithEmail, signUpWithEmail, loginWithGoogle, userProfile } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!name.trim()) {
          setError('Please enter your full name');
          setIsSubmitting(false);
          return;
        }
        await signUpWithEmail(email, password, name);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1E1B18] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-[#EAE4DC] dark:border-stone-800 p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#C85C43]/15 text-[#C85C43] flex items-center justify-center font-bold">
              <LogIn className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-extrabold text-[#241A17] dark:text-stone-100">
              {mode === 'login' ? 'Sign In to Your Account' : 'Create New Account'}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#FAF7F0] dark:hover:bg-stone-800 flex items-center justify-center text-[#807872] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 hover:border-[#C85C43] text-[#241A17] dark:text-stone-100 font-bold text-xs flex items-center justify-center gap-3 transition-all mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-[#EAE4DC] dark:border-stone-800" />
          <span className="px-3 text-[11px] text-[#807872] uppercase font-bold">Or Email</span>
          <div className="flex-1 border-t border-[#EAE4DC] dark:border-stone-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'signup' && (
            <div>
              <label className="text-[11px] font-bold text-[#807872] block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-[#807872]" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chidi Okonkwo"
                  className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-xs text-[#241A17] dark:text-stone-100 focus:outline-hidden focus:border-[#C85C43]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold text-[#807872] block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-[#807872]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-xs text-[#241A17] dark:text-stone-100 focus:outline-hidden focus:border-[#C85C43]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#807872] block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-[#807872]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-[#FAF7F0] dark:bg-stone-900 border border-[#EAE4DC] dark:border-stone-800 text-xs text-[#241A17] dark:text-stone-100 focus:outline-hidden focus:border-[#C85C43]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 rounded-full bg-[#C85C43] hover:bg-[#B44F37] text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Authenticating...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError(null);
            }}
            className="text-xs text-[#C85C43] font-bold hover:underline"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
