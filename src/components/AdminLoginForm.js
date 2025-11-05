import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LoadingSpinner from './LoadingSpinner';

const AdminLoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email ve şifre gereklidir.');
      return;
    }

    if (email !== 'admin@ackaraca.me') {
      setError('Bu email adresi admin değil.');
      return;
    }

    try {
      await login(email, password);
      onLoginSuccess?.();
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Giriş başarısız. Email veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">AK</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Admin Panel
            </h1>
            <p className="text-slate-400">
              Yönetici girişi yapın
            </p>
          </div>

          {/* Login Form */}
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

            {/* Email Field */}
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
                  className="block w-full pl-10 pr-3 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="admin@ackaraca.me"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Şifre
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
                  className="block w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg bg-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                  placeholder="Şifrenizi girin"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-300 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner text="" />
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <span>Giriş Yap</span>
              )}
            </button>
          </form>
          {/* Back to Home */}
          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
            >
              ← Ana sayfaya dön
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLoginForm;
