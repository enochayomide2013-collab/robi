import React, { useState } from 'react';
import { X, LogIn, Shield, KeyRound, UserCheck, Lock } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (username: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enable2FA, setEnable2FA] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    onLoginSuccess(username);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-2xl flex items-center justify-center font-black text-2xl text-slate-950 mx-auto">
            A
          </div>
          <h2 className="text-xl font-black text-white">{isSignUp ? 'Create ACADO Account' : 'Sign In to ACADO'}</h2>
          <p className="text-xs text-slate-400">Multi-factor security & encrypted authentication</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-300">Username</label>
            <input
              type="text"
              required
              placeholder="e.g. AlexBuilder"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span>Enable 2FA Authenticator</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg mt-2"
          >
            {isSignUp ? 'Create Secure Account' : 'Sign In'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-cyan-400 font-bold hover:underline cursor-pointer"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
