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
    <nav className="bg-slate-900/98 backdrop-blur-md border-b border-slate-800/50 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <img 
              src="/logo.svg" 
              alt="AK Logo" 
              className="w-10 h-10 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-xl"
            />
            <span className="text-lg font-bold text-white hidden sm:block bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">ACKaraca.me</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2 flex-grow justify-center mx-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-xs font-semibold rounded-md transition-all duration-200 whitespace-nowrap ${
                  location.pathname === item.href
                    ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right side controls */}
          <div className="hidden lg:flex items-center space-x-3">
            <LanguageSwitcher />
            
            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-2 text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-md transition-all duration-200 border border-amber-500/30"
              >
                ⚙️ Admin
              </Link>
            )}
            
            {user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-700">
                <div className="flex items-center space-x-2 text-xs text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="max-w-[100px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors duration-200"
                  title="Çıkış"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
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
            transition={{ duration: 0.3 }}
            className="lg:hidden border-t border-slate-800/50 bg-slate-900/98 backdrop-blur-md overflow-hidden"
          >
            <div className="py-3 space-y-1 px-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {isAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-sm font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg border border-amber-500/30 transition-all duration-200 mt-3"
                >
                  ⚙️ Admin Panel
                </Link>
              )}
              
              {user && (
                <div className="pt-4 mt-4 border-t border-slate-800/50 px-0">
                  <div className="flex items-center space-x-2 px-4 mb-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-400 truncate">{user.email}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Çıkış Yap</span>
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
