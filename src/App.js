import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Sayfalar
import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PaftaPage from './pages/PaftaPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import AccountDeletionPage from './pages/AccountDeletionPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutMePage from './pages/AboutMePage';
import PortfolioPage from './pages/PortfolioPage'; // Import the new page
import ArchivedWorksPage from './pages/ArchivedWorksPage';
import ExperimentsPage from './pages/ExperimentsPage'; // Import the new page
import InspirationGalleryPage from './pages/InspirationGalleryPage';
import InspirationDetailPage from './pages/InspirationDetailPage';
import SemesterProjectsPage from './pages/SemesterProjectsPage'; // Import the new page
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
// Bileşenler
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Context
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ProjectProvider>
          <Router>
            <div className="min-h-screen bg-slate-900">
            <Navbar />
            
            <AnimatePresence mode="wait">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <HomePage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/about" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AboutMePage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/portfolio" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PortfolioPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/archived-works" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArchivedWorksPage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/experiments" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ExperimentsPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/inspiration-gallery" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InspirationGalleryPage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/inspiration/:id" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <InspirationDetailPage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/semester-projects" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SemesterProjectsPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/blog" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BlogPage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/blog/:id" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BlogPostPage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/project/:id" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ProjectDetailPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/pafta/:qrCode" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <PaftaPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/admin" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AdminPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="/contact" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ContactPage />
                    </motion.div>
                  } 
                />

                <Route 
                  path="/account-delete" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <AccountDeletionPage />
                    </motion.div>
                  } 
                />
                
                <Route 
                  path="*" 
                  element={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <NotFoundPage />
                    </motion.div>
                  } 
                />
              </Routes>
            </AnimatePresence>
            
            <Footer />
            </div>
          </Router>
        </ProjectProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
