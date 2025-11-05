import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <motion.div
        className="text-center max-w-md mx-auto p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="text-8xl font-bold text-primary-600 mb-6"
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          404
        </motion.div>
        
        <h1 className="text-3xl font-bold text-secondary-800 mb-4">
          Sayfa Bulunamadı
        </h1>
        
        <p className="text-secondary-600 mb-8">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
          Ana sayfaya dönerek istediğiniz içeriği bulabilirsiniz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="btn-primary inline-flex items-center justify-center space-x-2"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="btn-outline inline-flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Geri Dön</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
