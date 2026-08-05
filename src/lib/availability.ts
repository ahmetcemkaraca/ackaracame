import type { Locale } from '../context/AppPreferences';
import type { SiteSettings } from '../domain/content';

export const isAcceptingInquiries = (availability: SiteSettings['availability']) =>
  availability !== 'unavailable';

export const availabilityLabel = (
  availability: SiteSettings['availability'],
  locale: Locale,
) => ({
  'open-to-inquiries': {
    tr: 'Yeni iş ve işbirliği görüşmelerine açık',
    en: 'Open to work and collaboration conversations',
  },
  limited: {
    tr: 'Yeni görüşmeler için sınırlı müsaitlik',
    en: 'Limited availability for new conversations',
  },
  unavailable: {
    tr: 'Şu anda yeni görüşmelere kapalı',
    en: 'Not currently accepting new enquiries',
  },
})[availability][locale];
