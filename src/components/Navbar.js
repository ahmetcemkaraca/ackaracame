import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, logout } = useAuth();
  const { t } = useLanguage();

  const navigation = [
    { name: t('common.home'), href: '/' },
    { name: t('common.portfolio'), href: '/portfolio' },
    { name: t('common.archive'), href: '/archived-works' },
    { name: t('common.experiments'), href: '/experiments' },
    { name: t('common.inspirations'), href: '/inspiration-gallery' },
    { name: t('common.semesterProjects'), href: '/semester-projects' },
    { name: t('common.blog'), href: '/blog' },
    { name: t('common.services'), href: '/services' },
    { name: t('common.about'), href: '/about' },
    { name: t('common.contact'), href: '/contact' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setIsOpen(false);
    } catch (error) {
      console.error('Çıkış yapılırken hata:', error);
    }
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 shadow-lg sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">AK</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Ahmet Karaca</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  location.pathname === item.href
                    ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {isAdmin && (
              <Link
                to="/admin"
                className="ml-2 px-4 py-2 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg transition-all duration-200 border border-amber-500/20"
              >
                {t('common.admin')}
              </Link>
            )}
            
            <div className="ml-4 pl-4 border-l border-slate-700">
              <LanguageSwitcher />
            </div>
            
            {user && (
              <div className="ml-4 flex items-center space-x-3 pl-4 border-l border-slate-700">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-400 max-w-[120px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-300 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center space-x-3">
            <LanguageSwitcher />
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 text-xs font-medium text-amber-400 border border-amber-500/20 rounded-lg"
              >
                Admin
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white transition-colors duration-200 p-2 hover:bg-slate-800 rounded-lg"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm"
          >
            <div className="py-4 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user && (
                <div className="pt-4 mt-4 border-t border-slate-800 px-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-400">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('common.logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
