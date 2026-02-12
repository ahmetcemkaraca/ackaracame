import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/ahmetcemkaraca' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/ahmet-cem-karaca/' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'Email', icon: Mail, href: 'mailto:info@ackaraca.me' },
  ];

  return (
    <footer className="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-slate-800 pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Column */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-serif font-bold text-lg group-hover:bg-primary-hover transition-colors">A</div>
              <span className="text-xl font-bold tracking-widest uppercase text-slate-900 dark:text-white">ACK<span className="text-primary">.ARCH</span></span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              {t('footer.description') || "Sadeliği takdir eden bir mimar ve geliştirici. Karmaşıklık yerine özü bularak, anlamlı mekanlar ve kullanışlı araçlar yaratıyorum."}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Portfolio</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/portfolio" className="hover:text-primary transition-colors">{t('common.projects') || "Projects"}</Link></li>
              <li><Link to="/applications" className="hover:text-primary transition-colors">{t('common.applications') || "Applications"}</Link></li>
              <li><Link to="/experiments" className="hover:text-primary transition-colors">{t('common.experiments') || "Experiments"}</Link></li>
              <li><Link to="/archived-works" className="hover:text-primary transition-colors">{t('common.archive') || "Archive"}</Link></li>
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Studio</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/about" className="hover:text-primary transition-colors">{t('common.about') || "About"}</Link></li>
              <li><Link to="/blog" className="hover:text-primary transition-colors">{t('common.blog') || "Journal"}</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">{t('common.contact') || "Contact"}</Link></li>
              <li><Link to="/services" className="hover:text-primary transition-colors">Services</Link></li>
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Legal</h4>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/dua/privacy" className="hover:text-primary transition-colors">{t('common.privacyPolicy') || "Privacy Policy"}</Link></li>
              <li><Link to="/dua/terms" className="hover:text-primary transition-colors">{t('common.terms') || "Terms of Service"}</Link></li>
              <li><Link to="/account-delete" className="hover:text-red-500 transition-colors">Hesap Silme</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-500 font-mono">
            © {currentYear} Ahmet Cem Karaca. All Rights Reserved. Built with React & Firebase.
          </p>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">System Status: Online</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
