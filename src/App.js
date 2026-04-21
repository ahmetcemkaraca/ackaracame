import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import HomePage from './pages/HomePage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import PortfolioChangelogPage from './pages/PortfolioChangelogPage';
import PaftaPage from './pages/PaftaPage';
import AdminPage from './pages/AdminPage';
import ContactPage from './pages/ContactPage';
import AccountDeletionPage from './pages/AccountDeletionPage';
import NotFoundPage from './pages/NotFoundPage';
import AboutMePage from './pages/AboutMePage';
import PortfolioPage from './pages/PortfolioPage';
import ArchivedWorksPage from './pages/ArchivedWorksPage';
import ExperimentsPage from './pages/ExperimentsPage';
import InspirationGalleryPage from './pages/InspirationGalleryPage';
import InspirationDetailPage from './pages/InspirationDetailPage';
import SemesterProjectsPage from './pages/SemesterProjectsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';
import DuaNewsPage from './pages/DuaNewsPage';
import WhereToGoPrivacyPage from './pages/WhereToGoPrivacyPage';
import WhereToGoTermsPage from './pages/WhereToGoTermsPage';
import WhereToGoNewsPage from './pages/WhereToGoNewsPage';
import WhereToGoCsamPage from './pages/WhereToGoCsamPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AllTermsPage from './pages/AllTermsPage';
import AllPrivacyPage from './pages/AllPrivacyPage';
import ServicesPage from './pages/ServicesPage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ProjectProvider } from './context/ProjectContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

const page = (Component, initial = { opacity: 0, y: 20 }, animate = { opacity: 1, y: 0 }, exit = { opacity: 0, y: -20 }) => (
  <motion.div initial={initial} animate={animate} exit={exit} transition={{ duration: 0.3 }}>
    <Component />
  </motion.div>
);

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ProjectProvider>
            <Router>
              <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
                <Navbar />
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={page(HomePage, { opacity: 0 }, { opacity: 1 }, { opacity: 0 })} />
                    <Route path="/about" element={page(AboutMePage)} />
                    <Route path="/portfolio" element={page(PortfolioPage)} />
                    <Route path="/portfolio/:id" element={page(ProjectDetailPage)} />
                    <Route path="/portfolio/:id/changelog" element={page(PortfolioChangelogPage)} />
                    <Route path="/applications" element={page(() => <Navigate to="/portfolio" replace />)} />
                    <Route path="/applications/:id" element={page(ApplicationDetailPage)} />
                    <Route path="/project/:id" element={page(ProjectDetailPage)} />
                    <Route path="/archived-works" element={page(ArchivedWorksPage)} />
                    <Route path="/experiments" element={page(ExperimentsPage)} />
                    <Route path="/inspiration-gallery" element={page(InspirationGalleryPage)} />
                    <Route path="/inspiration/:id" element={page(InspirationDetailPage)} />
                    <Route path="/semester-projects" element={page(SemesterProjectsPage)} />
                    <Route path="/blog" element={page(BlogPage)} />
                    <Route path="/blog/:id" element={page(BlogPostPage)} />
                    <Route path="/pafta/:qrCode" element={page(PaftaPage, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.95 })} />
                    <Route path="/admin" element={page(AdminPage, { opacity: 0, x: 20 }, { opacity: 1, x: 0 }, { opacity: 0, x: -20 })} />
                    <Route path="/contact" element={page(ContactPage)} />
                    <Route path="/services" element={page(ServicesPage)} />
                    <Route path="/account-delete" element={page(AccountDeletionPage)} />
                    <Route path="/terms" element={page(TermsPage)} />
                    <Route path="/privacy" element={page(PrivacyPage)} />
                    <Route path="/all/terms" element={page(AllTermsPage)} />
                    <Route path="/all/privacy" element={page(AllPrivacyPage)} />
                    <Route path="/dua/news" element={page(DuaNewsPage)} />
                    <Route path="/wheretogo/privacy" element={page(WhereToGoPrivacyPage)} />
                    <Route path="/wheretogo/terms" element={page(WhereToGoTermsPage)} />
                    <Route path="/wheretogo/news" element={page(WhereToGoNewsPage)} />
                    <Route path="/wheretogo/csam" element={page(WhereToGoCsamPage)} />
                    <Route path="*" element={page(NotFoundPage, { opacity: 0 }, { opacity: 1 }, { opacity: 0 })} />
                  </Routes>
                </AnimatePresence>
                <Footer />
              </div>
            </Router>
          </ProjectProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
