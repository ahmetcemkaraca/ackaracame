import { useEffect, useState } from 'react';
import { SiteSettingsService } from '../firebase/services';

const defaultSettings = {
  footerTagline: 'Mimar. Gelistirici. Yaratici.',
  footerSubline: 'Blud 🥀',
  footerCopyrightPrefix: '©',
  footerCopyrightText: 'Ahmet Cem Karaca. All Rights Reserved.',
  footerCopyrightSuffix: 'Copyrighted Twinn 🥀🥀🥀',
  homeHeroSubtitle: 'Sadeligi takdir eden bir mimar ve gelistirici. Karmasiklik yerine ozu bularak, anlamli mekanlar ve kullanisli araclar yaratiyorum.',
  siteWebsiteUrl: 'https://ackaraca.me'
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    let active = true;

    SiteSettingsService.get()
      .then((data) => {
        if (!active || !data) return;
        setSettings((prev) => ({ ...prev, ...data }));
      })
      .catch((error) => {
        console.warn('Site settings could not be loaded:', error);
      });

    return () => {
      active = false;
    };
  }, []);

  return settings;
};
