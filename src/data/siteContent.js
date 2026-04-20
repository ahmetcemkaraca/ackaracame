export const projects = [
  {
    id: 'draw-or-die',
    title: 'Draw Or Die',
    description: 'Çizim ve eskiz tabanlı, hızlı karar verme odaklı deneysel bir TypeScript projesi. Fikir üretimi, sunum ve görsel karar akışlarını tek ekranda toplar.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=Draw+Or+Die',
      'https://placehold.co/1200x900/111827/e2e8f0?text=Concept',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=Iteration'
    ],
    technologies: ['TypeScript', 'Canvas API', 'Framer Motion'],
    year: '2026',
    semester: 'Personal',
    featured: true,
    order: 1,
    status: 'active',
    location: 'Antalya, TR'
  },
  {
    id: 'hocapuanla',
    title: 'Hoca Puanla',
    description: 'Ders ve eğitmen geri bildirimi için tasarlanmış hafif bir değerlendirme projesi. Anonim skorlar, yorumlar ve dönemsel özetler sunar.',
    category: 'yazilim',
    images: [
      'https://placehold.co/1600x1000/0f172a/f8fafc?text=Hoca+Puanla',
      'https://placehold.co/1200x900/111827/e2e8f0?text=Ratings',
      'https://placehold.co/1200x900/1f2937/e5e7eb?text=Summary'
    ],
    technologies: ['TypeScript', 'Firebase', 'Data Visualization'],
    year: '2026',
    semester: 'Personal',
    featured: false,
    order: 2,
    status: 'active',
    location: 'Antalya, TR'
  }
];

export const applications = [
  {
    id: 'archbuilder',
    title: 'ArchBuilder',
    version: 'v1.0.0 • Live',
    type: 'Web Platform',
    iconName: 'Monitor',
    image: 'https://placehold.co/1600x900/0f172a/f8fafc?text=ArchBuilder',
    description: 'Yapay zeka destekli mimari proje oluşturma platformu. Kullanıcıyı soru-cevap akışıyla yönlendirerek konsept, program ve sunum verilerini düzenler.',
    techStack: [
      { name: 'TypeScript', color: 'bg-cyan-400' },
      { name: 'AI Workflow', color: 'bg-green-500' },
      { name: 'Firebase', color: 'bg-yellow-400' }
    ],
    link: 'https://archbuilder.app',
    linkText: 'Uygulamaya Git'
  },
  {
    id: 'duaapp',
    title: 'DuaAPP',
    version: 'v2.1.0 • Mobile',
    type: 'iOS / Android',
    iconName: 'Smartphone',
    image: 'https://placehold.co/1600x900/0f172a/f8fafc?text=DuaAPP',
    description: 'Günlük dualar, kategorilere ayrılmış içerikler ve çok dilli kullanım akışları için hazırlanmış mobil deneyim. Manevi içerik odaklı hafif bir ürün dili kullanır.',
    techStack: [
      { name: 'Dart', color: 'bg-blue-500' },
      { name: 'Firebase', color: 'bg-orange-500' },
      { name: 'Localization', color: 'bg-purple-500' }
    ],
    link: '/dua/news',
    linkText: 'Güncellemeler'
  },
  {
    id: 'where-to-go',
    title: 'Where To-Go',
    version: 'v1.0.0 • Mobile',
    type: 'iOS / Android',
    iconName: 'Globe',
    image: 'https://placehold.co/1600x900/0f172a/f8fafc?text=Where+To-Go',
    description: 'Aile odaklı konum ve etkinlik keşfi için tasarlanmış mobil ürün. Güvenli rota önerileri, ilgi alanı filtreleri ve çocuk güvenliği duyarlı karar desteği sağlar.',
    techStack: [
      { name: 'React Native', color: 'bg-blue-500' },
      { name: 'Maps API', color: 'bg-green-500' },
      { name: 'Firebase', color: 'bg-orange-500' }
    ],
    link: '/wheretogo/news',
    linkText: 'Proje Notları'
  }
];

export const findProjectById = (id) => projects.find((project) => project.id === id) || null;
export const findApplicationById = (id) => applications.find((application) => application.id === id) || null;