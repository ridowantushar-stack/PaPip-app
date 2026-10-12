import React, { useState } from 'react';
import { X, Play, Mail, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    login,
    signup,
    allUsers,
    switchDemoUser,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (authModalMode === 'forgot') {
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 600));
      setIsLoading(false);
      setResetSent(true);
      return;
    }

    if (authModalMode === 'login') {
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      setIsLoading(true);
      try {
        await login(email, password);
        setEmail('');
        setPassword('');
      } catch (err: any) {
        setError(err.message || 'Login failed.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // signup
      if (!name.trim()) {
        setError('Please enter your full creator name.');
        return;
      }
      if (!email.includes('@')) {
        setError('Please enter a valid email address.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      setIsLoading(true);
      try {
        await signup(name, email, password, handle);
        setName('');
        setEmail('');
        setPassword('');
      } catch (err: any) {
        setError(err.message || 'Signup failed.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white dark:bg-[#16181D] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 p-6 text-gray-900 dark:text-gray-100 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C91420] to-[#FF3B48] shadow-md shadow-red-500/30">
            <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight font-mono">
              Pa<span className="text-[#FF2A38]">Pip</span>
            </h2>
            <p className="text-[11px] text-gray-400">Watch • Create • Share</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-100 dark:bg-[#0D0E11] rounded-2xl mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('login');
              setError('');
              setResetSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'login'
                ? 'bg-white dark:bg-[#1C1F26] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalMode('signup');
              setError('');
              setResetSent(false);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              authModalMode === 'signup'
                ? 'bg-white dark:bg-[#1C1F26] text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-300 font-medium">
            {error}
          </div>
        )}

        {resetSent ? (
          <div className="py-6 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-sm">Password Reset Sent</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              We sent a password reset link to <strong className="text-gray-900 dark:text-white">{email}</strong>.
            </p>
            <button
              onClick={() => {
                setResetSent(false);
                setAuthModalMode('login');
              }}
              className="mt-3 px-4 py-2 text-xs font-bold text-[#FF2A38] hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {authModalMode === 'signup' && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Channel / Display Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jordan VFX"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Unique Handle
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="@jordanvfx (optional)"
                    className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38]"
                  />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38]"
                />
              </div>
            </div>

            {authModalMode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                    Password
                  </label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setAuthModalMode('forgot')}
                      className="text-[11px] text-[#FF2A38] hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-[#0D0E11] border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-[#FF2A38]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-tr from-[#C91420] to-[#FF3B48] text-white text-xs font-bold shadow-md shadow-red-500/20 hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>
                {isLoading
                  ? 'Processing...'
                  : authModalMode === 'login'
                  ? 'Sign In to PaPip'
                  : authModalMode === 'signup'
                  ? 'Create Free Channel'
                  : 'Send Reset Link'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-Click Persona Quick Access */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-[11px] font-semibold text-gray-400 text-center mb-2.5">
            Or quick demo with preset creator profile:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {allUsers.slice(0, 2).map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => switchDemoUser(user.id)}
                className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 hover:bg-red-50/50 dark:bg-[#0D0E11] dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-800 text-left transition-colors"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-gray-900 dark:text-gray-100 truncate">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">{user.handle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
