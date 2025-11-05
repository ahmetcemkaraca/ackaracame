# Ahmet Karaca - Portfolyö Sitesi

Mimarlık öğrencisi için modern ve kapsamlı portfolyö sitesi. Firebase ile güçlendirilmiş, QR kod entegrasyonlu ve yapay zeka veri gösterimli.

## 🚀 Özellikler

### Ana Özellikler
- **Modern Portfolyö Tasarımı**: Responsive ve kullanıcı dostu arayüz
- **Proje Yönetimi**: Mimari ve yazılım projelerini kategorize etme
- **QR Kod Entegrasyonu**: Paftalar için QR kod oluşturma ve okuma
- **Yapay Zeka Veri Gösterimi**: AI kullanım bilgilerini detaylı şekilde sunma
- **Admin Paneli**: Kolay içerik yönetimi
- **Firebase Entegrasyonu**: Gerçek zamanlı veri yönetimi

### Teknik Özellikler
- **React 18**: Modern React hooks ve context API
- **Firebase**: Firestore, Storage, Authentication
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animasyonlar
- **QR Code**: QR kod oluşturma ve okuma
- **Responsive Design**: Tüm cihazlarda mükemmel görünüm

## 📁 Proje Yapısı

```
src/
├── components/          # Yeniden kullanılabilir bileşenler
│   ├── Navbar.js       # Navigasyon çubuğu
│   ├── Footer.js       # Alt bilgi
│   ├── ProjectCard.js  # Proje kartı
│   ├── QRCodeGenerator.js # QR kod oluşturucu
│   ├── QRCodeScanner.js   # QR kod okuyucu
│   ├── ProjectForm.js     # Proje formu
│   ├── PaftaForm.js       # Pafta formu
│   └── LoadingSpinner.js  # Yükleme göstergesi
├── pages/              # Sayfa bileşenleri
│   ├── HomePage.js     # Ana sayfa
│   ├── ProjectDetailPage.js # Proje detay sayfası
│   ├── PaftaPage.js    # Pafta sayfası
│   ├── AdminPage.js    # Admin paneli
│   ├── ContactPage.js  # İletişim sayfası
│   └── NotFoundPage.js # 404 sayfası
├── context/            # React Context API
│   ├── ProjectContext.js # Proje yönetimi
│   └── AuthContext.js    # Kimlik doğrulama
├── firebase/           # Firebase konfigürasyonu
│   ├── config.js       # Firebase ayarları
│   ├── models.js       # Veri modelleri
│   └── services.js     # Firebase servisleri
└── App.js              # Ana uygulama
```

## 🛠️ Kurulum

### Gereksinimler
- Node.js 16+ 
- npm veya yarn
- Firebase projesi

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
cd ackaracame
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Firebase konfigürasyonu**
   - Firebase Console'da yeni proje oluşturun
   - Firestore Database'i etkinleştirin
   - Storage'ı etkinleştirin
   - Authentication'ı etkinleştirin (Email/Password)
   - `env.example` dosyasını `.env` olarak kopyalayın
   - Firebase konfigürasyon bilgilerini `.env` dosyasına ekleyin

4. **Uygulamayı başlatın**
```bash
npm start
```

## 🔧 Firebase Kurulumu

### Firestore Koleksiyonları

#### projects
```javascript
{
  title: string,
  description: string,
  category: 'mimari' | 'yazilim',
  images: string[],
  technologies: string[],
  year: string,
  semester: string,
  featured: boolean,
  order: number,
  status: 'active' | 'archived',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### paftas
```javascript
{
  title: string,
  description: string,
  projectId: string,
  qrCodeData: string,
  images: string[],
  aiData: {
    tools: Array<{name: string, purpose: string}>,
    prompts: string[],
    models: Array<{name: string, version: string, description: string}>,
    parameters: object,
    results: Array<{title: string, description: string, metrics: object}>,
    processingTime: number,
    accuracy: number,
    notes: string
  },
  semester: string,
  year: string,
  status: 'active' | 'archived',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### messages
```javascript
{
  name: string,
  email: string,
  subject: string,
  message: string,
  status: 'unread' | 'read' | 'replied',
  createdAt: timestamp
}
```

### Storage Kuralları
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /images/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Firestore Kuralları
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Projeler - herkes okuyabilir, sadece admin yazabilir
    match /projects/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@ackaraca.me';
    }
    
    // Paftalar - herkes okuyabilir, sadece admin yazabilir
    match /paftas/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@ackaraca.me';
    }
    
    // Mesajlar - herkes yazabilir, sadece admin okuyabilir
    match /messages/{document} {
      allow read: if request.auth != null && request.auth.token.email == 'admin@ackaraca.me';
      allow create: if true;
    }
    
    // Site ayarları - herkes okuyabilir, sadece admin yazabilir
    match /siteSettings/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email == 'admin@ackaraca.me';
    }
  }
}
```

## 🎨 Kullanım

### Admin Paneli
1. `/admin` sayfasına gidin
2. Admin hesabıyla giriş yapın
3. Projeler ve paftalar ekleyin/düzenleyin
4. QR kodları oluşturun

### QR Kod Sistemi
1. Admin panelinde pafta oluşturun
2. QR kod otomatik oluşturulur
3. QR kodu indirin ve paftanıza yapıştırın
4. QR kod okutulduğunda pafta sayfası açılır

### Proje Yönetimi
- Mimari ve yazılım projelerini kategorize edin
- Görseller yükleyin
- Teknolojileri belirtin
- Öne çıkan projeleri işaretleyin

## 📱 Responsive Tasarım

Site tüm cihazlarda mükemmel çalışır:
- **Desktop**: Tam özellikli deneyim
- **Tablet**: Optimize edilmiş layout
- **Mobile**: Touch-friendly arayüz

## 🔒 Güvenlik

- Firebase Authentication ile güvenli giriş
- Firestore kuralları ile veri koruması
- Admin yetkileri ile erişim kontrolü
- Dosya yükleme güvenliği

## 🚀 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy
```

### Netlify
```bash
npm run build
# dist klasörünü Netlify'a yükleyin
```

### Vercel
```bash
npm run build
# Vercel CLI ile deploy edin
```

## 📞 Destek

Herhangi bir sorun yaşarsanız:
- Email: info@ackaraca.me
- GitHub Issues kullanın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**Ahmet Karaca** - Mimarlık Öğrencisi & Yazılım Geliştirici
