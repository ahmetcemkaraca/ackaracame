// Firebase Firestore veri modelleri

// Kullanıcı modeli
export const UserModel = {
  uid: '', // Firebase Auth UID
  email: '',
  displayName: '',
  photoURL: '',
  role: 'user', // 'user' veya 'admin'
  createdAt: null,
  updatedAt: null
};

// Proje modeli
export const ProjectModel = {
  id: '',
  title: '',
  description: '',
  category: '', // 'mimari' veya 'yazilim'
  images: [], // Görsel URL'leri
  technologies: [], // Kullanılan teknolojiler
  year: '',
  semester: '', // Dönem bilgisi
  status: 'active', // 'active', 'archived'
  featured: false, // Ana sayfada öne çıkarılsın mı
  order: 0, // Sıralama
  createdAt: null,
  updatedAt: null
};

// Pafta modeli
export const PaftaModel = {
  id: '',
  title: '',
  description: '',
  projectId: '', // Hangi projeye ait
  qrCode: '', // QR kod URL'i
  qrCodeData: '', // QR kod verisi
  images: [], // Pafta görselleri
  aiData: {
    tools: [], // Kullanılan AI araçları
    prompts: [], // Kullanılan prompt'lar
    models: [], // Kullanılan AI modelleri
    parameters: {}, // AI parametreleri
    results: [], // AI sonuçları
    processingTime: 0, // İşlem süresi
    accuracy: 0, // Doğruluk oranı
    notes: '' // Ek notlar
  },
  semester: '',
  year: '',
  status: 'active',
  createdAt: null,
  updatedAt: null
};

// İletişim mesajı modeli
export const ContactModel = {
  id: '',
  name: '',
  email: '',
  subject: '',
  message: '',
  status: 'unread', // 'unread', 'read', 'replied'
  createdAt: null
};

// Site ayarları modeli
export const SiteSettingsModel = {
  id: 'main',
  siteTitle: 'Ahmet Karaca - Portfolyö',
  siteDescription: 'Mimarlık öğrencisi portfolyö sitesi',
  contactEmail: '',
  socialLinks: {
    linkedin: '',
    github: '',
    instagram: '',
    behance: ''
  },
  heroText: {
    title: 'Merhaba, Ben Ahmet Karaca',
    subtitle: 'Mimarlık Öğrencisi & Yazılım Geliştirici',
    description: 'Yaratıcı tasarımlar ve yenilikçi çözümlerle geleceği şekillendiriyorum.'
  },
  updatedAt: null
};
