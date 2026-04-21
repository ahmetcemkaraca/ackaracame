import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AdminSecurityService } from '../firebase/services';
import LoadingSpinner from './LoadingSpinner';

const ADMIN_EMAIL = 'admin@ackaraca.me';

const formatRemaining = (lockedUntil) => {
  if (!lockedUntil) return '';
  const diff = Math.max(0, lockedUntil - Date.now());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}s ${minutes}dk`;
};

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [lockState, setLockState] = useState({ isLocked: false, lockedUntil: null, attemptsRemaining: 3 });
  const { login, loading } = useAuth();

  useEffect(() => {
    let active = true;

    const syncStatus = async () => {
      try {
        const status = await AdminSecurityService.getStatus();
        if (active) setLockState(status);
      } catch (statusError) {
        console.warn('Admin login status could not be loaded:', statusError);
      }
    };

    syncStatus();
    const interval = window.setInterval(syncStatus, 60000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const lockMessage = useMemo(() => {
    if (!lockState.isLocked) return '';
    return `Admin girisi gecici olarak kilitlendi. Tekrar denemek icin kalan sure: ${formatRemaining(lockState.lockedUntil)}.`;
  }, [lockState]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email ve sifre gereklidir.');
      return;
    }

    if (email !== ADMIN_EMAIL) {
      setError('Bu email adresi admin degil.');
      return;
    }

    try {
      const status = await AdminSecurityService.getStatus();
      setLockState(status);

      if (status.isLocked) {
        setError(`Yeni girisler kilitli. Kalan sure: ${formatRemaining(status.lockedUntil)}.`);
        return;
      }

      await login(email, password);
      await AdminSecurityService.recordSuccess({ email });
      onLoginSuccess?.();
    } catch (loginError) {
      console.error('Giris hatasi:', loginError);

      try {
        const failureState = await AdminSecurityService.recordFailure({ email });
        setLockState(failureState);
        if (failureState.isLocked) {
          setError(`3 yanlis deneme sonrasi giris 24 saat kilitlendi. Kalan sure: ${formatRemaining(failureState.lockedUntil)}.`);
        } else {
          setError(`Giris basarisiz. Kalan deneme hakki: ${failureState.attemptsRemaining}.`);
        }
      } catch (guardError) {
        console.error('Admin guard update failed:', guardError);
        setError('Giris basarisiz. Email veya sifre hatali.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">AK</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Panel</h1>
            <p className="text-slate-400">Yonetici girisi yapin</p>
          </div>

          {lockState.isLocked && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 mt-0.5" />
              <p className="text-sm text-amber-100">{lockMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{error}</span>
              </motion.div>
            )}

            {!lockState.isLocked && (
              <p className="text-xs text-slate-400">
                Bu ekran 3 yanlis denemeden sonra 24 saat yeni girisleri durdurur. Aktif oturumlar etkilenmez.
              </p>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Adresi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder={ADMIN_EMAIL}
                  required
                  disabled={lockState.isLocked}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Sifre
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border border-slate-700 rounded-lg bg-slate-800 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Sifrenizi girin"
                  required
                  disabled={lockState.isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || lockState.isLocked}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner text="" />
                  <span>Giris yapiliyor...</span>
                </>
              ) : (
                <span>Giris Yap</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
              ← Ana sayfaya don
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginForm;
