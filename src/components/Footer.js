import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const socialLinks = [
    { name: 'GitHub', icon: Github, href: 'https://github.com/ahmetcemkaraca' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://www.linkedin.com/in/ahmet-cem-karaca/' },
    { name: 'Email', icon: Mail, href: 'mailto:info@ackaraca.me' },
  ];

  const navigation = [
    { name: t('common.home'), href: '/' },
    { name: t('common.portfolio'), href: '/portfolio' },
    { name: t('common.blog'), href: '/blog' },
    { name: t('common.about'), href: '/about' },
    { name: t('common.contact'), href: '/contact' },
  ];

  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom">
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center space-x-3 mb-4">
                <img 
                  src="/logo.svg" 
                  alt="ACK Logo" 
                  className="w-10 h-10 transition-all duration-300 hover:scale-110"
                />
                <span className="text-xl font-bold">Ahmet Cem Karaca</span>
              </Link>
              <p className="text-secondary-300 mb-6 max-w-md">
                {t('footer.description')}
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
                      className="w-10 h-10 bg-secondary-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                      aria-label={social.name}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h3>
              <ul className="space-y-2">
                {navigation.map((item) => (
                    <li key={item.name}>
                        <Link 
                            to={item.href} 
                            className="text-secondary-300 hover:text-white transition-colors duration-200"
                        >
                            {item.name}
                        </Link>
                    </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">{t('footer.contact')}</h3>
              <ul className="space-y-2 text-secondary-300">
                <li>info@ackaraca.me</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary-400 text-sm">
              {t('footer.rights', { year: currentYear })}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
